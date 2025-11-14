const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

/**
 * Room Routes
 */

// Public routes
router.get('/', roomController.getRooms);
router.get('/amenities', roomController.getAmenities);
router.get('/available', roomController.searchAvailableRooms);
router.get('/:id', roomController.getRoomById);

// Admin routes
router.post(
	'/',
	authenticateToken,
	authorizeRoles('admin'),
	roomController.createRoom
);
router.put(
	'/:id',
	authenticateToken,
	authorizeRoles('admin'),
	roomController.updateRoom
);
router.delete(
	'/:id',
	authenticateToken,
	authorizeRoles('admin'),
	roomController.deleteRoom
);

// Image upload routes
router.post(
	'/:id/images',
	authenticateToken,
	authorizeRoles('admin', 'staff'),
	upload.array('images', 5), // Max 5 images at once
	roomController.uploadRoomImages
);
router.delete(
	'/:id/images',
	authenticateToken,
	authorizeRoles('admin', 'staff'),
	roomController.deleteRoomImage
);

module.exports = router;
