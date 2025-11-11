const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = 
  require('../middlewares/auth');

/**
 * @route   GET /api/users
 * @desc    Get all users (Admin only)
 * @access  Private/Admin
 */
router.get(
  '/',
  authenticateToken,
  authorizeRoles('admin'),
  (req, res) => {
    res.status(200).json({
      status: 'success',
      message: 'User routes - Coming soon'
    });
  }
);

module.exports = router;
