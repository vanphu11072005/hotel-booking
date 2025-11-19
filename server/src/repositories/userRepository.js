const { User, Booking, Role } = require('../databases/models');
const { Op } = require('sequelize');

class UserRepository {
  /**
   * Find all users with filters and pagination
   * @param {Object} whereClause - Sequelize where conditions
   * @param {number} limit - Number of records per page
   * @param {number} offset - Number of records to skip
   * @returns {Promise<{count: number, rows: Array}>}
   */
  async findAllUsers(whereClause, limit, offset) {
    return await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Role,
          as: 'role',
          attributes: ['name'],
        },
      ],
      limit: limit,
      offset: offset,
      order: [['created_at', 'DESC']],
    });
  }

  /**
   * Find user by ID with role and bookings
   * @param {number} id - User ID
   * @returns {Promise<User|null>}
   */
  async findUserById(id) {
    return await User.findByPk(id, {
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
  }

  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Promise<User|null>}
   */
  async findUserByEmail(email) {
    return await User.findOne({ where: { email } });
  }

  /**
   * Find user by email excluding specific ID
   * @param {string} email - User email
   * @param {number} excludeId - User ID to exclude
   * @returns {Promise<User|null>}
   */
  async findUserByEmailExcludingId(email, excludeId) {
    return await User.findOne({
      where: {
        email,
        user_id: { [Op.ne]: excludeId },
      },
    });
  }

  /**
   * Create new user
   * @param {Object} userData - User data
   * @returns {Promise<User>}
   */
  async createUser(userData) {
    return await User.create(userData);
  }

  /**
   * Update user
   * @param {User} user - User instance
   * @param {Object} updateData - Data to update
   * @returns {Promise<User>}
   */
  async updateUser(user, updateData) {
    return await user.update(updateData);
  }

  /**
   * Delete user
   * @param {User} user - User instance
   * @returns {Promise<void>}
   */
  async deleteUser(user) {
    return await user.destroy();
  }

  /**
   * Count active bookings for user
   * @param {number} userId - User ID
   * @returns {Promise<number>}
   */
  async countActiveBookings(userId) {
    return await Booking.count({
      where: {
        user_id: userId,
        status: { [Op.in]: ['pending', 'confirmed', 'checked_in'] },
      },
    });
  }

  /**
   * Build where clause for user filters
   * @param {Object} filters - Filter parameters
   * @returns {Object} Sequelize where clause
   */
  buildWhereClause(filters) {
    const whereClause = {};
    const { search, role, status } = filters;

    // Filter by search (full_name, email, or phone)
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

    return whereClause;
  }
}

// Export singleton instance
module.exports = new UserRepository();
