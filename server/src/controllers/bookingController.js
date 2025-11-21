const bookingService = require('../services/bookingService');

/**
 * Create a new booking
 * POST /api/bookings
 */
const createBooking = async (req, res, next) => {
	try {
		const result = await bookingService.createBooking(
			req.user.id,
			req.body
		);

		return res.status(201).json({
			success: true,
			data: { booking: result.booking },
			message: result.message,
		});
	} catch (error) {
		if (error.statusCode) {
			return res.status(error.statusCode).json({
				status: 'error',
				message: error.message,
			});
		}
		next(error);
	}
};

/**
 * Create booking with multiple room types
 * POST /api/bookings/multi-room-type
 */
const createMultiRoomTypeBooking = async (req, res, next) => {
	try {
		const result = await bookingService.createMultiRoomTypeBooking(
			req.user.id,
			req.body
		);

		return res.status(201).json({
			success: true,
			data: { 
				booking: result.booking
			},
			message: result.message,
		});
	} catch (error) {
		if (error.statusCode) {
			return res.status(error.statusCode).json({
				status: 'error',
				message: error.message,
			});
		}
		next(error);
	}
};

/**
 * Get bookings for current user
 * GET /api/bookings/me
 */
const getMyBookings = async (req, res, next) => {
	try {
		const bookings = await bookingService.getMyBookings(req.user.id);
		res.status(200).json({ success: true, data: { bookings } });
	} catch (error) {
		next(error);
	}
};

/**
 * Get booking by id
 * GET /api/bookings/:id
 */
const getBookingById = async (req, res, next) => {
	try {
		const { id } = req.params;
		const booking = await bookingService.getBookingById(
			id,
			req.user?.id
		);
		res.status(200).json({ success: true, data: { booking } });
	} catch (error) {
		if (error.statusCode) {
			return res.status(error.statusCode).json({
				status: 'error',
				message: error.message,
			});
		}
		next(error);
	}
};

/**
 * Cancel a booking
 * PATCH /api/bookings/:id/cancel
 */
const cancelBooking = async (req, res, next) => {
	try {
		const { id } = req.params;
		const booking = await bookingService.cancelBooking(
			id,
			req.user.id,
			req.body
		);
		res.status(200).json({ success: true, data: { booking } });
	} catch (error) {
		if (error.statusCode) {
			return res.status(error.statusCode).json({
				status: 'error',
				message: error.message,
			});
		}
		next(error);
	}
};

/**
 * Check booking by booking number
 * GET /api/bookings/check/:bookingNumber
 */
const checkBookingByNumber = async (req, res, next) => {
	try {
		const { bookingNumber } = req.params;
		const booking = await bookingService.checkBookingByNumber(
			bookingNumber
		);
		res.status(200).json({ status: 'success', data: { booking } });
	} catch (error) {
		if (error.statusCode) {
			return res.status(error.statusCode).json({
				status: 'error',
				message: error.message,
			});
		}
		next(error);
	}
};

/**
 * Get all bookings (Admin only)
 * GET /api/bookings
 */
const getAllBookings = async (req, res, next) => {
	try {
		const result = await bookingService.getAllBookings(req.query);
		res.status(200).json({
			status: 'success',
			data: result,
		});
	} catch (error) {
		next(error);
	}
};

/**
 * Update booking status (Admin only)
 * PUT /api/bookings/:id
 */
const updateBooking = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { status } = req.body;
		const booking = await bookingService.updateBookingStatus(
			id,
			status
		);
		res.status(200).json({
			status: 'success',
			message: 'Booking updated successfully',
			data: { booking },
		});
	} catch (error) {
		if (error.statusCode) {
			return res.status(error.statusCode).json({
				status: 'error',
				message: error.message,
			});
		}
		next(error);
	}
};

module.exports = {
	createBooking,
	createMultiRoomTypeBooking,
	getMyBookings,
	getBookingById,
	cancelBooking,
	checkBookingByNumber,
	getAllBookings,
	updateBooking,
};
