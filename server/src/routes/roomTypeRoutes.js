const express = require('express');
const router = express.Router();
const roomTypeController = require('../controllers/roomTypeController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');
const { uploadRoomImages } = require('../middlewares/upload');

// Public: Get all room types
router.get('/', roomTypeController.getRoomTypes);

// Admin: Upload room type images
router.post('/upload', authenticateToken, authorizeRoles('admin'), uploadRoomImages.array('images', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No images uploaded'
      });
    }

    const imagePaths = req.files.map(file => `/uploads/room_types/${file.filename}`);
    
    res.status(200).json({
      status: 'success',
      data: {
        images: imagePaths
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to upload images'
    });
  }
});

// Admin: Create room type
router.post('/', authenticateToken, authorizeRoles('admin'), roomTypeController.createRoomType);

// Admin: Update room type
router.put('/:id', authenticateToken, authorizeRoles('admin'), roomTypeController.updateRoomType);

// Admin: Delete room type
router.delete('/:id', authenticateToken, authorizeRoles('admin'), roomTypeController.deleteRoomType);

module.exports = router;
