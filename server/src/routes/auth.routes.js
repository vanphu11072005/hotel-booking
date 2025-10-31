const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const {
  registerValidation,
  loginValidation,
  validate
} = require('../validators/auth.validator');

// Public routes
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

router.post('/logout', authController.logout);

router.post('/refresh-token', authController.refreshToken);

// Protected routes
router.get('/profile', authenticate, authController.getProfile);

module.exports = router;
