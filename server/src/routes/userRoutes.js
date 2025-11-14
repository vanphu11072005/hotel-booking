const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, authorizeRoles } = 
  require('../middlewares/auth');

/**
 * GET /api/users - Get all users (Admin/Staff)
 */
router.get(
  '/',
  authenticateToken,
  authorizeRoles('admin', 'staff'),
  userController.getUsers
);

/**
 * GET /api/users/:id - Get user by ID (Admin/Staff)
 */
router.get(
  '/:id',
  authenticateToken,
  authorizeRoles('admin', 'staff'),
  userController.getUserById
);

/**
 * POST /api/users - Create new user (Admin)
 */
router.post(
  '/',
  authenticateToken,
  authorizeRoles('admin'),
  userController.createUser
);

/**
 * PUT /api/users/:id - Update user (Admin)
 */
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('admin'),
  userController.updateUser
);

/**
 * DELETE /api/users/:id - Delete user (Admin)
 */
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('admin'),
  userController.deleteUser
);

module.exports = router;
