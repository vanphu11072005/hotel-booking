const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');

/**
 * @route   GET /api/bookings
 * @desc    Get user bookings
 * @access  Private
 */
router.get('/', authenticateToken, (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Booking routes - Coming soon',
    data: {
      bookings: []
    }
  });
});

module.exports = router;
