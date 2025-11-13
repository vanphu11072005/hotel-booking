const authService = require('../services/authService');

/**
 * Register new user
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    const result = await authService.register({
      name,
      email,
      password,
      phone
    });

    // Set refresh token as HttpOnly cookie (default 7 days for new users)
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/'
    };

    res.cookie('refreshToken', result.refreshToken, cookieOptions);

    // Don't send refreshToken in response body
    const { refreshToken, ...dataWithoutRefreshToken } = result;

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: dataWithoutRefreshToken
    });
  } catch (error) {
    if (error.message === 'Email already registered') {
      return res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
    next(error);
  }
};

/**
 * Login user
 */
const login = async (req, res, next) => {
  try {
    const { email, password, rememberMe } = req.body;

    const result = await authService.login({
      email,
      password,
      rememberMe
    });

    // Set refresh token as HttpOnly cookie
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: rememberMe 
        ? 7 * 24 * 60 * 60 * 1000 
        : 1 * 24 * 60 * 60 * 1000,
      path: '/'
    };

    res.cookie('refreshToken', result.refreshToken, cookieOptions);

    // Don't send refreshToken in response body
    const { refreshToken, ...dataWithoutRefreshToken } = result;

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: dataWithoutRefreshToken
    });
  } catch (error) {
    if (error.message === 'Invalid email or password') {
      return res.status(401).json({
        status: 'error',
        message: error.message
      });
    }
    next(error);
  }
};

/**
 * Refresh access token
 */
const refreshAccessToken = async (req, res, next) => {
  try {
    // Get refresh token from cookie instead of body
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        status: 'error',
        message: 'Refresh token not found'
      });
    }

    const result = await authService.refreshAccessToken(refreshToken);

    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError' || 
        error.message.includes('token')) {
      // Clear invalid cookie
      res.clearCookie('refreshToken');
      return res.status(401).json({
        status: 'error',
        message: error.message
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
    // Get refresh token from cookie
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      await authService.logout(refreshToken);
    }

    // Clear refresh token cookie
    res.clearCookie('refreshToken', { path: '/' });

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
    const user = await authService.getProfile(req.user.id);

    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({
        status: 'error',
        message: error.message
      });
    }
    next(error);
  }
};

/**
 * Forgot Password - Send reset link
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const result = await authService.forgotPassword(email);

    res.status(200).json({
      status: 'success',
      message: result.message
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

    const result = await authService.resetPassword({
      token,
      password
    });

    res.status(200).json({
      status: 'success',
      message: result.message
    });
  } catch (error) {
    if (error.message.includes('token') || 
        error.message.includes('required')) {
      return res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
    if (error.message === 'User not found') {
      return res.status(404).json({
        status: 'error',
        message: error.message
      });
    }
    if (
      error.message.includes('must be different') ||
      error.message.includes('Mật khẩu mới')
    ) {
      return res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
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
