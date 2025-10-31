const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { User, Role, RefreshToken } = require('../models');

// Generate tokens
const generateTokens = (userId) => {
  const token = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '1h' }
  );

  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET || 
      'your-refresh-secret-key',
    { expiresIn: '7d' }
  );

  return { token, refreshToken };
};

// Register new user
exports.register = async (req, res, next) => {
  try {
    const { email, password, full_name, phone, address } = 
      req.body;

    // Check if user exists
    const existingUser = await User.findOne({ 
      where: { email } 
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email đã được sử dụng'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Get customer role
    const customerRole = await Role.findOne({
      where: { name: 'customer' }
    });

    if (!customerRole) {
      return res.status(500).json({
        success: false,
        message: 'System error: Role not found'
      });
    }

    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      full_name,
      phone,
      address,
      role_id: customerRole.id,
      is_active: true
    });

    // Generate tokens
    const { token, refreshToken } = generateTokens(user.id);

    // Save refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await RefreshToken.create({
      user_id: user.id,
      token: refreshToken,
      expires_at: expiresAt
    });

    // Get user with role
    const userWithRole = await User.findByPk(user.id, {
      include: [
        {
          model: Role,
          as: 'role',
          attributes: ['id', 'name', 'description']
        }
      ],
      attributes: { exclude: ['password'] }
    });

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      data: {
        user: userWithRole,
        token,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
};

// Login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user with role
    const user = await User.findOne({
      where: { email },
      include: [
        {
          model: Role,
          as: 'role',
          attributes: ['id', 'name', 'description']
        }
      ]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng'
      });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản đã bị khóa'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(
      password,
      user.password
    );

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng'
      });
    }

    // Generate tokens
    const { token, refreshToken } = generateTokens(user.id);

    // Save refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await RefreshToken.create({
      user_id: user.id,
      token: refreshToken,
      expires_at: expiresAt
    });

    // Remove password from response
    const userResponse = user.toJSON();

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        user: userResponse,
        token,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
};

// Logout
exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await RefreshToken.destroy({
        where: { token: refreshToken }
      });
    }

    res.json({
      success: true,
      message: 'Đăng xuất thành công'
    });
  } catch (error) {
    next(error);
  }
};

// Refresh token
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 
        'your-refresh-secret-key'
    );

    // Check if refresh token exists in database
    const tokenRecord = await RefreshToken.findOne({
      where: { 
        token: refreshToken,
        user_id: decoded.id
      }
    });

    if (!tokenRecord) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Check if token expired
    if (new Date() > tokenRecord.expires_at) {
      await tokenRecord.destroy();
      return res.status(401).json({
        success: false,
        message: 'Refresh token expired'
      });
    }

    // Generate new tokens
    const tokens = generateTokens(decoded.id);

    // Update refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await RefreshToken.create({
      user_id: decoded.id,
      token: tokens.refreshToken,
      expires_at: expiresAt
    });

    // Delete old refresh token
    await tokenRecord.destroy();

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token: tokens.token,
        refreshToken: tokens.refreshToken
      }
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }
    next(error);
  }
};

// Get profile
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [
        {
          model: Role,
          as: 'role',
          attributes: ['id', 'name', 'description']
        }
      ],
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};
