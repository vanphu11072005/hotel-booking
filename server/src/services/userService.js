const userRepository = require('../repositories/userRepository');
const bcrypt = require('bcryptjs');

class UserService {
  /**
   * Get all users with filters and pagination
   * @param {Object} filters - Query filters
   * @returns {Promise<Object>}
   */
  async getUsers(filters) {
    const { page = 1, limit = 10 } = filters;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const whereClause = userRepository.buildWhereClause(filters);
    const { count, rows: users } = 
      await userRepository.findAllUsers(
        whereClause,
        parseInt(limit),
        offset
      );

    // Transform users to include role string and status string
    const transformedUsers = users.map((user) => {
      return this.transformUser(user.toJSON());
    });

    return {
      users: transformedUsers,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit)),
      },
    };
  }

  /**
   * Get user by ID
   * @param {number} id - User ID
   * @returns {Promise<Object>}
   */
  async getUserById(id) {
    const user = await userRepository.findUserById(id);

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    return this.transformUser(user.toJSON());
  }

  /**
   * Create new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>}
   */
  async createUser(userData) {
    const {
      email,
      password,
      full_name,
      phone_number,
      role = 'customer',
      status = 'active',
    } = userData;

    // Validate password
    if (!password || password.length < 6) {
      const error = new Error(
        'Password is required and must be at least 6 characters'
      );
      error.statusCode = 400;
      throw error;
    }

    // Check if email already exists
    const existingUser = await userRepository.findUserByEmail(email);
    if (existingUser) {
      const error = new Error('Email already exists');
      error.statusCode = 400;
      throw error;
    }

    // Map role string to role_id
    const roleMap = { admin: 1, staff: 2, customer: 3 };
    const role_id = roleMap[role] || 3;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user - map phone_number to phone for DB
    const user = await userRepository.createUser({
      email,
      password: hashedPassword,
      full_name,
      phone: phone_number,
      role_id,
      is_active: status === 'active',
    });

    // Remove password from response
    const userResponse = user.toJSON();
    delete userResponse.password;

    return userResponse;
  }

  /**
   * Update user
   * @param {number} id - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>}
   */
  async updateUser(id, updateData) {
    const {
      full_name,
      email,
      phone_number,
      role,
      status,
      password,
    } = updateData;

    const user = await userRepository.findUserById(id);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = 
        await userRepository.findUserByEmailExcludingId(email, id);
      if (existingUser) {
        const error = new Error('Email already exists');
        error.statusCode = 400;
        throw error;
      }
    }

    // Validate password if provided
    if (password && password.length < 6) {
      const error = new Error(
        'Password must be at least 6 characters'
      );
      error.statusCode = 400;
      throw error;
    }

    // Map role string to role_id
    const roleMap = { admin: 1, staff: 2, customer: 3 };

    // Prepare update data - map phone_number to phone
    const dataToUpdate = {};
    if (full_name !== undefined) dataToUpdate.full_name = full_name;
    if (email !== undefined) dataToUpdate.email = email;
    if (phone_number !== undefined) dataToUpdate.phone = phone_number;
    if (role !== undefined) dataToUpdate.role_id = roleMap[role] || 3;
    if (status !== undefined) 
      dataToUpdate.is_active = status === 'active';

    // Hash password if provided
    if (password) {
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    await userRepository.updateUser(user, dataToUpdate);

    // Remove password from response
    const userResponse = user.toJSON();
    delete userResponse.password;

    return userResponse;
  }

  /**
   * Delete user
   * @param {number} id - User ID
   * @returns {Promise<void>}
   */
  async deleteUser(id) {
    const user = await userRepository.findUserById(id);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    // Check if user has active bookings
    const activeBookings = 
      await userRepository.countActiveBookings(id);

    if (activeBookings > 0) {
      const error = new Error(
        'Cannot delete user with active bookings'
      );
      error.statusCode = 400;
      throw error;
    }

    await userRepository.deleteUser(user);
  }

  /**
   * Transform user data for response
   * @param {Object} userJson - User JSON object
   * @returns {Object} Transformed user
   */
  transformUser(userJson) {
    return {
      ...userJson,
      role: userJson.role?.name || 'customer',
      status: userJson.is_active ? 'active' : 'inactive',
      phone_number: userJson.phone,
    };
  }
}

// Export singleton instance
module.exports = new UserService();
