const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');
const bookingController = require('../controllers/bookingController');

// Get all bookings (Admin/Staff only)
// GET /api/bookings
router.get(
  '/',
  authenticateToken,
  authorizeRoles('admin', 'staff'),
  bookingController.getAllBookings
);

// Create a new booking
// POST /api/bookings
router.post('/', authenticateToken, bookingController.createBooking);

// Get bookings for current user
// GET /api/bookings/me
router.get('/me', authenticateToken, bookingController.getMyBookings);

// Get booking by id
// GET /api/bookings/:id
router.get('/:id', authenticateToken, bookingController.getBookingById);

// Update booking status (Admin/Staff only)
// PUT /api/bookings/:id
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('admin', 'staff'),
  bookingController.updateBooking
);

// Cancel booking
// PATCH /api/bookings/:id/cancel
router.patch('/:id/cancel', authenticateToken, bookingController.cancelBooking);

// Check booking by booking number
// GET /api/bookings/check/:bookingNumber
router.get('/check/:bookingNumber', bookingController.checkBookingByNumber);

module.exports = router;
