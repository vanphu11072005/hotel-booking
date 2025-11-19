const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const authRepository = require('../repositories/authRepository');
const { sendEmail } = require('../utils/mailer');

/**
 * Auth Service - Business logic layer
 * Xử lý logic nghiệp vụ authentication
 */
class AuthService {
  /**
   * Generate JWT tokens
   */
  generateTokens(userId) {
    const accessToken = jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    const refreshToken = jwt.sign(
      { userId },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );

    return { accessToken, refreshToken };
  }

  /**
   * Verify JWT token
   */
  verifyAccessToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
  }

  /**
   * Verify refresh token
   */
  verifyRefreshToken(token) {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  }

  /**
   * Hash password
   */
  async hashPassword(password) {
    return await bcrypt.hash(password, 10);
  }

  /**
   * Compare password
   */
  async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  /**
   * Format user response
   */
  formatUserResponse(user) {
    return {
      id: user.id,
      name: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role ? user.role.name : 'customer',
      createdAt: user.created_at,
      updatedAt: user.updated_at
    };
  }

  /**
   * Register new user
   */
  async register(data) {
    const { name, email, password, phone } = data;

    // Check if email exists
    const emailExists = await authRepository.isEmailExists(email);
    if (emailExists) {
      throw new Error('Email đã được đăng ký');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(password);

    // Create user (default role_id = 3 for customer)
    const user = await authRepository.createUser({
      full_name: name,
      email,
      password: hashedPassword,
      phone,
      role_id: 3 // Customer role
    });

    // Generate tokens
    const { accessToken, refreshToken } = 
      this.generateTokens(user.id);

    // Save refresh token (expires in 7 days)
    const expiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    );
    await authRepository.saveRefreshToken(
      user.id, 
      refreshToken, 
      expiresAt
    );

    // Remove password from response
    const userResponse = user.toJSON();
    delete userResponse.password;

    // Send welcome email (non-blocking)
    try {
      await sendEmail({
        to: user.email,
        subject: 'Chào mừng đến với Hotel Booking',
        html: `
          <div style="font-family: Arial, sans-serif; 
            max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4F46E5;">
              Chào mừng ${user.full_name}!
            </h2>
            <p>Cảm ơn bạn đã đăng ký tài khoản tại 
              <strong>Hotel Booking</strong>.</p>
            <p>Tài khoản của bạn đã được tạo thành công với 
              email: <strong>${user.email}</strong></p>
            <div style="background-color: #F3F4F6; 
              padding: 20px; border-radius: 8px; 
              margin: 20px 0;">
              <p style="margin: 0;">
                <strong>Bạn có thể:</strong>
              </p>
              <ul style="margin-top: 10px;">
                <li>Tìm kiếm và đặt phòng khách sạn</li>
                <li>Quản lý đặt phòng của bạn</li>
                <li>Cập nhật thông tin cá nhân</li>
              </ul>
            </div>
            <p>
              <a href="${process.env.CLIENT_URL}/login" 
                style="background-color: #4F46E5; 
                color: white; padding: 12px 24px; 
                text-decoration: none; border-radius: 6px; 
                display: inline-block;">
                Đăng nhập ngay
              </a>
            </p>
            <p style="color: #6B7280; font-size: 14px; 
              margin-top: 30px;">
              Nếu bạn có bất kỳ câu hỏi nào, vui lòng 
              liên hệ với chúng tôi.
            </p>
          </div>
        `
      });
    } catch (err) {
      console.error('Failed to send welcome email:', err);
      // Don't fail registration if email fails
    }

    return {
      user: userResponse,
      token: accessToken,
      refreshToken
    };
  }

  /**
   * Calculate lock duration based on consecutive locks
   * First lock: 5 minutes
   * Second lock (within same session): 15 minutes
   * Third lock: 30 minutes
   * Fourth+ lock: 60 minutes
   */
  calculateLockDuration(lockCount) {
    if (lockCount === 1) return 5 * 60 * 1000; // 5 minutes
    if (lockCount === 2) return 15 * 60 * 1000; // 15 minutes
    if (lockCount === 3) return 30 * 60 * 1000; // 30 minutes
    return 60 * 60 * 1000; // 60 minutes
  }

  /**
   * Format lock duration for display
   */
  formatLockDuration(milliseconds) {
    const minutes = Math.ceil(milliseconds / (60 * 1000));
    if (minutes < 60) {
      return `${minutes} phút`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours} giờ`;
    }
    return `${hours} giờ ${remainingMinutes} phút`;
  }

  /**
   * Login user
   */
  async login(data) {
    const { email, password, rememberMe } = data;

    // Find user with role (include password for verification)
    const user = await authRepository.findUserByEmail(
      email, 
      true,
      true // include password
    );

    if (!user) {
      throw new Error('Email hoặc mật khẩu không đúng');
    }

    // Check if account is locked
    if (user.locked_until && new Date() < user.locked_until) {
      const remainingTime = user.locked_until - new Date();
      const duration = this.formatLockDuration(remainingTime);
      throw new Error(
        `Tài khoản đã bị khóa do nhập sai mật khẩu quá nhiều lần. ` +
        `Vui lòng thử lại sau ${duration}.|${user.locked_until.toISOString()}`
      );
    }

    // Reset login attempts if lock has expired
    // Keep lock_count to track consecutive locks
    if (user.locked_until && new Date() >= user.locked_until) {
      await authRepository.resetLoginAttemptsOnly(user.id);
      user.login_attempts = 0;
      user.locked_until = null;
    }

    // Check password
    const isPasswordValid = await this.comparePassword(
      password, 
      user.password
    );
    
    if (!isPasswordValid) {
      // Increment login attempts
      const newAttempts = (user.login_attempts || 0) + 1;
      const now = new Date();

      // First attempt - just show generic error without counting down
      if (newAttempts === 1) {
        await authRepository.updateLoginAttempts(
          user.id,
          newAttempts,
          null,
          now
        );
        throw new Error('Email hoặc mật khẩu không đúng');
      }

      // From 2nd attempt onwards, show remaining tries (5,4,3,2,1)
      // Lock after 6th attempt (when remaining = 0)
      if (newAttempts >= 7) {
        // Increment lock count for progressive locking
        const newLockCount = (user.lock_count || 0) + 1;
        const lockDuration = this.calculateLockDuration(newLockCount);
        const lockedUntil = new Date(now.getTime() + lockDuration);
        
        await authRepository.updateLoginAttemptsWithLock(
          user.id,
          newAttempts,
          lockedUntil,
          now,
          newLockCount
        );

        const duration = this.formatLockDuration(lockDuration);
        throw new Error(
          `Tài khoản đã bị khóa do nhập sai mật khẩu quá nhiều lần. ` +
          `Vui lòng thử lại sau ${duration}.|${lockedUntil.toISOString()}`
        );
      } else {
        // Show countdown from 2nd to 6th attempt
        await authRepository.updateLoginAttempts(
          user.id,
          newAttempts,
          null,
          now
        );

        // Calculate remaining attempts (7 total - current attempts)
        // newAttempts=2 → 5 remaining, newAttempts=3 → 4 remaining, etc.
        const remainingAttempts = 7 - newAttempts;
        throw new Error(
          `Email hoặc mật khẩu không đúng. ` +
          `Còn ${remainingAttempts} lần thử trước khi tài khoản bị khóa.`
        );
      }
    }

    // Reset login attempts AND lock_count on successful login
    if (user.login_attempts > 0 || user.lock_count > 0) {
      await authRepository.resetLoginAttempts(user.id);
    }

    // Generate tokens
    const { accessToken, refreshToken } = 
      this.generateTokens(user.id);

    // Calculate expiry based on rememberMe
    const expiryDays = rememberMe ? 7 : 1;
    const expiresAt = new Date(
      Date.now() + expiryDays * 24 * 60 * 60 * 1000
    );

    // Save refresh token
    await authRepository.saveRefreshToken(
      user.id,
      refreshToken,
      expiresAt
    );

    // Format user response
    const userResponse = this.formatUserResponse(user);

    return {
      user: userResponse,
      token: accessToken,
      refreshToken
    };
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken) {
    if (!refreshToken) {
      throw new Error('Refresh token is required');
    }

    // Verify refresh token
    const decoded = this.verifyRefreshToken(refreshToken);

    // Check if refresh token exists in database
    const storedToken = await authRepository.findRefreshToken(
      refreshToken,
      decoded.userId
    );

    if (!storedToken) {
      throw new Error('Invalid refresh token');
    }

    // Check if token is expired
    if (new Date() > storedToken.expires_at) {
      await authRepository.deleteRefreshToken(refreshToken);
      throw new Error('Refresh token expired');
    }

    // Generate new access token
    const accessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    return { token: accessToken };
  }

  /**
   * Logout user
   */
  async logout(refreshToken) {
    if (refreshToken) {
      await authRepository.deleteRefreshToken(refreshToken);
    }
    return true;
  }

  /**
   * Get user profile
   */
  async getProfile(userId) {
    const user = await authRepository.findUserById(userId, true);

    if (!user) {
      throw new Error('User not found');
    }

    return this.formatUserResponse(user);
  }

  /**
   * Generate reset token
   */
  generateResetToken() {
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    return { resetToken, hashedToken };
  }

  /**
   * Forgot Password - Send reset link
   */
  async forgotPassword(email) {
    // Find user by email
    const user = await authRepository.findUserByEmail(email);

    // Always return success to prevent email enumeration
    if (!user) {
      return {
        success: true,
        message: 'If email exists, reset link has been sent'
      };
    }

    // Generate reset token
    const { resetToken, hashedToken } = 
      this.generateResetToken();

    // Save token (expires in 1 hour)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await authRepository.savePasswordResetToken(
      user.id,
      hashedToken,
      expiresAt
    );

    // Build reset URL
    const resetUrl = 
      `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // Try to send email
    try {
      await sendEmail({
        to: user.email,
        subject: 'Reset password - Hotel Booking',
        html: `
          <p>Bạn (hoặc ai đó) đã yêu cầu đặt lại mật khẩu.</p>
          <p>Nhấn vào liên kết bên dưới để đặt lại mật khẩu 
             (hết hạn sau 1 giờ):</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
        `
      });
    } catch (err) {
      console.error('Failed to send reset email:', err);
      // Do NOT log the raw reset token or URL in production.
      // Errors are logged above; token must remain secret.
    }

    return {
      success: true,
      message: 'Password reset link has been sent to your email'
    };
  }

  /**
   * Reset Password - Update password with token
   */
  async resetPassword(data) {
    const { token, password } = data;

    if (!token || !password) {
      throw new Error('Token and password are required');
    }

    // Hash the token to compare
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find valid token
    const resetToken = 
      await authRepository.findValidPasswordResetToken(
        hashedToken
      );

    if (!resetToken) {
      throw new Error('Invalid or expired reset token');
    }

    // Find user (include password so we can compare)
    const user = await authRepository.findUserById(
      resetToken.user_id,
      false, // includeRole
      true // includePassword
    );
    
    if (!user) {
      throw new Error('User not found');
    }

    // Check if new password matches old password
    const isSamePassword = await this.comparePassword(
      password,
      user.password
    );

    if (isSamePassword) {
      // Return a Vietnamese message to the client
      throw new Error('Mật khẩu mới phải khác mật khẩu cũ');
    }

    // Hash new password
    const hashedPassword = await this.hashPassword(password);

    // Update password
    await authRepository.updateUserPassword(
      user.id,
      hashedPassword
    );

    // Delete used token
    await authRepository.deletePasswordResetToken(resetToken.id);

    // Send confirmation email (non-blocking)
    try {
      await sendEmail({
        to: user.email,
        subject: 'Mật khẩu đã được thay đổi',
        html: `
          <p>Mật khẩu tài khoản ${user.email} đã được thay đổi 
             thành công.</p>
        `
      });
    } catch (err) {
      console.error('Failed to send confirmation email:', err);
    }

    return {
      success: true,
      message: 'Password has been reset successfully'
    };
  }
}

module.exports = new AuthService();
