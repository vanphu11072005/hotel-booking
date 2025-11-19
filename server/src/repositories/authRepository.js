const { 
  User, 
  RefreshToken, 
  Role, 
  PasswordResetToken 
} = require('../databases/models');
const { Op } = require('sequelize');

/**
 * Auth Repository - Data access layer
 * Xử lý các thao tác database liên quan đến authentication
 */
class AuthRepository {
  /**
   * Tìm user theo email
   */
  async findUserByEmail(email, includeRole = false, includePassword = false) {
    const options = { 
      where: { email } 
    };

    if (!includePassword) {
      options.attributes = { exclude: ['password'] };
    }

    if (includeRole) {
      options.include = [{
        model: Role,
        as: 'role',
        attributes: ['id', 'name']
      }];
    }

    return await User.findOne(options);
  }

  /**
   * Tìm user theo ID
   */
  async findUserById(userId, includeRole = false, includePassword = false) {
    // By default exclude password from returned attributes for safety.
    const options = {};

    if (!includePassword) {
      options.attributes = { exclude: ['password'] };
    }

    if (includeRole) {
      options.include = [{
        model: Role,
        as: 'role',
        attributes: ['id', 'name']
      }];
    }

    return await User.findByPk(userId, options);
  }

  /**
   * Tạo user mới
   */
  async createUser(userData) {
    return await User.create(userData);
  }

  /**
   * Cập nhật mật khẩu user
   */
  async updateUserPassword(userId, hashedPassword) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return await user.update({ password: hashedPassword });
  }

  /**
   * Lưu refresh token
   */
  async saveRefreshToken(userId, token, expiresAt) {
    return await RefreshToken.create({
      user_id: userId,
      token,
      expires_at: expiresAt
    });
  }

  /**
   * Tìm refresh token
   */
  async findRefreshToken(token, userId) {
    return await RefreshToken.findOne({
      where: { 
        token,
        user_id: userId
      }
    });
  }

  /**
   * Xóa refresh token
   */
  async deleteRefreshToken(token) {
    return await RefreshToken.destroy({
      where: { token }
    });
  }

  /**
   * Xóa tất cả refresh tokens của user
   */
  async deleteAllUserRefreshTokens(userId) {
    return await RefreshToken.destroy({
      where: { user_id: userId }
    });
  }

  /**
   * Lưu password reset token
   */
  async savePasswordResetToken(userId, hashedToken, expiresAt) {
    // Delete old tokens
    await this.deletePasswordResetTokensByUser(userId);

    // Create new token
    return await PasswordResetToken.create({
      user_id: userId,
      token: hashedToken,
      expires_at: expiresAt
    });
  }

  /**
   * Tìm password reset token hợp lệ
   */
  async findValidPasswordResetToken(hashedToken) {
    return await PasswordResetToken.findOne({
      where: {
        token: hashedToken,
        expires_at: {
          [Op.gt]: new Date()
        }
      }
    });
  }

  /**
   * Xóa password reset token
   */
  async deletePasswordResetToken(tokenId) {
    const token = await PasswordResetToken.findByPk(tokenId);
    if (token) {
      return await token.destroy();
    }
  }

  /**
   * Xóa tất cả password reset tokens của user
   */
  async deletePasswordResetTokensByUser(userId) {
    return await PasswordResetToken.destroy({
      where: { user_id: userId }
    });
  }

  /**
   * Kiểm tra email đã tồn tại
   */
  async isEmailExists(email) {
    const user = await User.findOne({ where: { email } });
    return !!user;
  }

  /**
   * Cập nhật số lần đăng nhập thất bại (không khóa)
   */
  async updateLoginAttempts(userId, attempts, lockedUntil, lastFailedLogin) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return await user.update({
      login_attempts: attempts,
      locked_until: lockedUntil,
      last_failed_login: lastFailedLogin
    });
  }

  /**
   * Cập nhật số lần đăng nhập thất bại với lock count
   */
  async updateLoginAttemptsWithLock(userId, attempts, lockedUntil, lastFailedLogin, lockCount) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return await user.update({
      login_attempts: attempts,
      locked_until: lockedUntil,
      last_failed_login: lastFailedLogin,
      lock_count: lockCount
    });
  }

  /**
   * Reset chỉ login attempts (giữ lock_count)
   */
  async resetLoginAttemptsOnly(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return await user.update({
      login_attempts: 0,
      locked_until: null,
      last_failed_login: null
    });
  }

  /**
   * Reset tất cả (login attempts + lock_count)
   */
  async resetLoginAttempts(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return await user.update({
      login_attempts: 0,
      locked_until: null,
      last_failed_login: null,
      lock_count: 0
    });
  }
}

module.exports = new AuthRepository();
