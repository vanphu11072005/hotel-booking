const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, RefreshToken, Role } = require('../databases/models');
const { sendEmail } = require('../utils/mailer');

/**
 * Generate JWT tokens
 */
const generateTokens = (userId) => {
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
};

/**
 * Register new user
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'Email already registered'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user (default role_id = 3 for customer)
    const user = await User.create({
      full_name: name,
      email,
      password: hashedPassword,
      phone,
      role_id: 3 // Customer role
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Save refresh token
    await RefreshToken.create({
      user_id: user.id,
      token: refreshToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    // Remove password from response
    const userResponse = user.toJSON();
    delete userResponse.password;

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        user: userResponse,
        token: accessToken,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 */
const login = async (req, res, next) => {
  try {
    const { email, password, rememberMe } = req.body;

    // Find user with role
    const user = await User.findOne({ 
      where: { email },
      include: [{
        model: Role,
        as: 'role',
        attributes: ['id', 'name']
      }]
    });

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(
      password, 
      user.password
    );
    
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Calculate expiry based on rememberMe
    const expiryDays = rememberMe ? 7 : 1;
    const expiresAt = new Date(
      Date.now() + expiryDays * 24 * 60 * 60 * 1000
    );

    // Save refresh token
    await RefreshToken.create({
      user_id: user.id,
      token: refreshToken,
      expires_at: expiresAt
    });

    // Prepare user response
    const userResponse = {
      id: user.id,
      name: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role ? user.role.name : 'customer'
    };

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: userResponse,
        token: accessToken,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh access token
 */
const refreshAccessToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        status: 'error',
        message: 'Refresh token is required'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken, 
      process.env.JWT_REFRESH_SECRET
    );

    // Check if refresh token exists in database
    const storedToken = await RefreshToken.findOne({
      where: { 
        token: refreshToken,
        user_id: decoded.userId
      }
    });

    if (!storedToken) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid refresh token'
      });
    }

    // Check if token is expired
    if (new Date() > storedToken.expires_at) {
      await storedToken.destroy();
      return res.status(401).json({
        status: 'error',
        message: 'Refresh token expired'
      });
    }

    // Generate new access token
    const accessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    res.status(200).json({
      status: 'success',
      data: {
        token: accessToken
      }
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Refresh token expired'
      });
    }
    next(error);
  }
};

/**
 * Logout user
 */
const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Delete refresh token from database
      await RefreshToken.destroy({
        where: { token: refreshToken }
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Logout successful'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user profile
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [{
        model: Role,
        as: 'role',
        attributes: ['id', 'name']
      }]
    });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    const userResponse = {
      id: user.id,
      name: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role ? user.role.name : 'customer',
      createdAt: user.created_at,
      updatedAt: user.updated_at
    };

    res.status(200).json({
      status: 'success',
      data: {
        user: userResponse
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Forgot Password - Send reset link
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.status(200).json({
        status: 'success',
        message: 'If email exists, reset link has been sent'
      });
    }

    // Generate reset token (for demo, we'll use simple token)
    // In production, use crypto.randomBytes()
    const resetToken = require('crypto')
      .randomBytes(32)
      .toString('hex');
    
    const hashedToken = require('crypto')
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Save to password_reset_tokens table
    const { PasswordResetToken } = require('../databases/models');
    
    // Delete old tokens for this user
    await PasswordResetToken.destroy({
      where: { user_id: user.id }
    });

    // Create new token (expires in 1 hour)
    await PasswordResetToken.create({
      user_id: user.id,
      token: hashedToken,
      expires_at: new Date(Date.now() + 60 * 60 * 1000)
    });

    // Build reset url
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // Try to send email. If sending fails, log the token/url but
    // still return success to avoid email enumeration.
    try {
      await sendEmail({
        to: user.email,
        subject: 'Reset password - Hotel Booking',
        html: `<p>Bạn (hoặc ai đó) đã yêu cầu đặt lại mật khẩu.</p>
               <p>Nhấn vào liên kết bên dưới để đặt lại mật khẩu (hết hạn sau 1 giờ):</p>
               <p><a href="${resetUrl}">${resetUrl}</a></p>`
      });
    } catch (err) {
      console.error('Failed to send reset email:', err);
      // fall through: still log reset url for developer convenience
      console.log('Reset token:', resetToken);
      console.log('Reset URL:', resetUrl);
    }

    res.status(200).json({
      status: 'success',
      message: 'Password reset link has been sent to your email'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset Password - Update password with token
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Token and password are required'
      });
    }

    // Hash the token to compare
    const hashedToken = require('crypto')
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find valid token
    const { PasswordResetToken } = require('../databases/models');
    const resetToken = await PasswordResetToken.findOne({
      where: {
        token: hashedToken,
        expires_at: {
          [require('sequelize').Op.gt]: new Date()
        }
      }
    });

    if (!resetToken) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid or expired reset token'
      });
    }

    // Find user
    const user = await User.findByPk(resetToken.user_id);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password
    await user.update({ password: hashedPassword });

    // Delete used token
    await resetToken.destroy();

    // Send confirmation email (non-blocking)
    try {
      await sendEmail({
        to: user.email,
        subject: 'Mật khẩu đã được thay đổi',
        html: `<p>Mật khẩu tài khoản ${user.email} đã được thay đổi thành công.</p>`
      });
    } catch (err) {
      console.error('Failed to send confirmation email:', err);
    }

    res.status(200).json({
      status: 'success',
      message: 'Password has been reset successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refreshAccessToken,
  logout,
  getProfile,
  forgotPassword,
  resetPassword
};
