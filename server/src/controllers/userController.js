const { User, Booking } = require('../databases/models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

/**
 * Get all users with filters and pagination
 * GET /api/users
 */
const getUsers = async (req, res, next) => {
  try {
    const {
      search,
      role,
      status,
      page = 1,
      limit = 10,
    } = req.query;

    const whereClause = {};

    // Filter by search (full_name or email)
    if (search) {
      whereClause[Op.or] = [
        { full_name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone_number: { [Op.like]: `%${search}%` } },
      ];
    }

    // Filter by role
    if (role) {
      whereClause.role = role;
    }

    // Filter by status
    if (status) {
      whereClause.status = status;
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['password'] },
      limit: parseInt(limit),
      offset: offset,
      order: [['created_at', 'DESC']],
    });

    res.status(200).json({
      status: 'success',
      data: {
        users,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user by ID
 * GET /api/users/:id
 */
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Booking,
          as: 'bookings',
          limit: 5,
          order: [['created_at', 'DESC']],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new user
 * POST /api/users
 */
const createUser = async (req, res, next) => {
  try {
    const {
      email,
      password,
      full_name,
      phone_number,
      role = 'customer',
      status = 'active',
    } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'Email already exists',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      full_name,
      phone_number,
      role,
      status,
    });

    // Remove password from response
    const userResponse = user.toJSON();
    delete userResponse.password;

    res.status(201).json({
      status: 'success',
      message: 'User created successfully',
      data: {
        user: userResponse,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user
 * PUT /api/users/:id
 */
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      full_name,
      phone_number,
      role,
      status,
      password,
    } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    // Prepare update data
    const updateData = {};
    if (full_name !== undefined) updateData.full_name = full_name;
    if (phone_number !== undefined) updateData.phone_number = phone_number;
    if (role !== undefined) updateData.role = role;
    if (status !== undefined) updateData.status = status;

    // Hash password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    await user.update(updateData);

    // Remove password from response
    const userResponse = user.toJSON();
    delete userResponse.password;

    res.status(200).json({
      status: 'success',
      message: 'User updated successfully',
      data: {
        user: userResponse,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user
 * DELETE /api/users/:id
 */
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    // Check if user has active bookings
    const activeBookings = await Booking.count({
      where: {
        user_id: id,
        status: { [Op.in]: ['pending', 'confirmed', 'checked_in'] },
      },
    });

    if (activeBookings > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete user with active bookings',
      });
    }

    await user.destroy();

    res.status(200).json({
      status: 'success',
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
