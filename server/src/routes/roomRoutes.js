const express = require('express');
const router = express.Router();

/**
 * @route   GET /api/rooms
 * @desc    Get all rooms
 * @access  Public
 */
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Room routes - Coming soon',
    data: {
      rooms: []
    }
  });
});

module.exports = router;
