const { User, Booking, Role } = require('../databases/models');
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

    // Filter by search (full_name or email or phone)
    if (search) {
      whereClause[Op.or] = [
        { full_name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
      ];
    }

    // Filter by role - map string to role_id
    if (role) {
      const roleMap = { admin: 1, staff: 2, customer: 3 };
      whereClause.role_id = roleMap[role];
    }

    // Filter by status - map to is_active
    if (status) {
      whereClause.is_active = status === 'active';
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Role,
          as: 'role',
          attributes: ['name'],
        },
      ],
      limit: parseInt(limit),
      offset: offset,
      order: [['created_at', 'DESC']],
    });

    // Transform users to include role string and status string
    const transformedUsers = users.map((user) => {
      const userJson = user.toJSON();
      return {
        ...userJson,
        role: userJson.role?.name || 'customer',
        status: userJson.is_active ? 'active' : 'inactive',
        phone_number: userJson.phone, // Map phone to phone_number for frontend
      };
    });

    res.status(200).json({
      status: 'success',
      data: {
        users: transformedUsers,
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
          model: Role,
          as: 'role',
          attributes: ['name'],
        },
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

    // Transform user to include role string and status string
    const userJson = user.toJSON();
    const transformedUser = {
      ...userJson,
      role: userJson.role?.name || 'customer',
      status: userJson.is_active ? 'active' : 'inactive',
      phone_number: userJson.phone, // Map phone to phone_number for frontend
    };

    res.status(200).json({
      status: 'success',
      data: {
        user: transformedUser,
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
      phone_number, // Accept phone_number from frontend
      role = 'customer',
      status = 'active',
    } = req.body;

    // Map role string to role_id
    const roleMap = {
      admin: 1,
      staff: 2,
      customer: 3,
    };
    const role_id = roleMap[role] || 3; // Default to customer (3)

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

    // Create user - map phone_number to phone for DB
    const user = await User.create({
      email,
      password: hashedPassword,
      full_name,
      phone: phone_number, // Map to DB column 'phone'
      role_id,
      is_active: status === 'active',
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
      email,
      phone_number, // Accept phone_number from frontend
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

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          status: 'error',
          message: 'Email already exists',
        });
      }
    }

    // Map role string to role_id
    const roleMap = {
      admin: 1,
      staff: 2,
      customer: 3,
    };

    // Prepare update data - map phone_number to phone
    const updateData = {};
    if (full_name !== undefined) updateData.full_name = full_name;
    if (email !== undefined) updateData.email = email;
    if (phone_number !== undefined) updateData.phone = phone_number; // Map to DB column
    if (role !== undefined) updateData.role_id = roleMap[role] || 3;
    if (status !== undefined) updateData.is_active = status === 'active';

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
