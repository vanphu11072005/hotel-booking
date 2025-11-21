const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');
const bookingController = require('../controllers/bookingController');

// Get all bookings (Staff only)
// GET /api/bookings
router.get(
  '/',
  authenticateToken,
  authorizeRoles('staff'),
  bookingController.getAllBookings
);

// Create a new booking
// POST /api/bookings
router.post('/', authenticateToken, bookingController.createBooking);

// Create multi-room-type booking
// POST /api/bookings/multi-room-type
router.post(
  '/multi-room-type', 
  authenticateToken, 
  bookingController.createMultiRoomTypeBooking
);

// Get bookings for current user
// GET /api/bookings/me
router.get('/me', authenticateToken, bookingController.getMyBookings);

// Get booking by id
// GET /api/bookings/:id
router.get('/:id', authenticateToken, bookingController.getBookingById);

// Update booking status (Staff only)
// PUT /api/bookings/:id
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('staff'),
  bookingController.updateBooking
);

// Cancel booking
// PATCH /api/bookings/:id/cancel
router.patch('/:id/cancel', authenticateToken, bookingController.cancelBooking);

// Check booking by booking number
// GET /api/bookings/check/:bookingNumber
router.get('/check/:bookingNumber', bookingController.checkBookingByNumber);

module.exports = router;
