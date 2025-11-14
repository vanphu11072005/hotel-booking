const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

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

module.exports = router;
