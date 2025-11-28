const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const {
  registerValidation,
  loginValidation,
  refreshTokenValidation
} = require('../validators/authValidator');
const upload = require('../middlewares/upload');

router.post(
  '/register',
  registerValidation,
  validate,
  authController.register
);

router.post(
  '/login',
  loginValidation,
  validate,
  authController.login
);

router.post(
  '/refresh-token',
  refreshTokenValidation,
  validate,
  authController.refreshAccessToken
);

router.post('/logout', authController.logout);
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, authController.updateProfile);

/**
 * Upload avatar for current user
 */
router.put(
  '/profile/avatar',
  authenticateToken,
  upload.single('avatar'),
  authController.uploadAvatar
 );

router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;
