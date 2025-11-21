// Public: Get all room types
const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const reviewController = require('../controllers/reviewController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

/**
 * Room Routes
 */

// Public routes
router.get('/', roomController.getRooms);
router.get('/amenities', roomController.getAmenities);
router.get('/available', roomController.searchAvailableRooms);
router.get('/room-types', roomController.getRoomTypes);
router.get('/:id', roomController.getRoomById);
router.get('/:id/available-count', roomController.getAvailableRoomCount);

// Public: Get reviews for a specific room (support /api/rooms/:id/reviews)
router.get('/:id/reviews', reviewController.getRoomReviews);
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

// Image upload routes (Admin only)
router.post(
	'/:id/images',
	authenticateToken,
	authorizeRoles('admin'),
	upload.array('images', 5), // Max 5 images at once
	roomController.uploadRoomImages
);
router.delete(
	'/:id/images',
	authenticateToken,
	authorizeRoles('admin'),
	roomController.deleteRoomImage
);

module.exports = router;
