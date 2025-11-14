const { Booking, Room, RoomType, Payment, sequelize, Sequelize } = require('../databases/models');
const { Op } = require('sequelize');

// Helper to generate a simple booking number
const generateBookingNumber = () => {
	const prefix = 'BK';
	const ts = Date.now();
	const rand = Math.floor(Math.random() * 9000) + 1000;
	return `${prefix}-${ts}-${rand}`;
};

/**
 * Create a new booking
 * POST /api/bookings
 */
const createBooking = async (req, res, next) => {
	const t = await sequelize.transaction();
	try {
		const user = req.user;
		const {
			room_id,
			check_in_date,
			check_out_date,
			guest_count,
			total_price,
			notes,
			payment_method = 'cash',
		} = req.body;

		if (!room_id || !check_in_date || !check_out_date || !total_price) {
			return res.status(400).json({
				status: 'error',
				message: 'Missing required booking fields',
			});
		}

		// Ensure room exists
		const room = await Room.findByPk(room_id, {
			include: [{ model: RoomType, as: 'room_type' }],
		});

		if (!room) {
			await t.rollback();
			return res.status(404).json({ status: 'error', message: 'Room not found' });
		}

		// Check for overlapping bookings (exclude cancelled)
		const overlapping = await Booking.findOne({
			where: {
				room_id,
				status: { [Op.ne]: 'cancelled' },
				[Op.and]: [
					{ check_in_date: { [Op.lt]: new Date(check_out_date) } },
					{ check_out_date: { [Op.gt]: new Date(check_in_date) } },
				],
			},
		});

		if (overlapping) {
			await t.rollback();
			return res.status(409).json({
				status: 'error',
				message: 'Room already booked for the selected dates',
			});
		}

		const bookingNumber = generateBookingNumber();

		// Determine if deposit is required (cash payment requires 20% deposit)
		const requiresDeposit = payment_method === 'cash';
		const depositPercentage = requiresDeposit ? 20 : 0;
		const depositAmount = requiresDeposit ? (total_price * depositPercentage) / 100 : 0;

		const booking = await Booking.create(
			{
				booking_number: bookingNumber,
				user_id: user.id,
				room_id,
				check_in_date: new Date(check_in_date),
				check_out_date: new Date(check_out_date),
				num_guests: guest_count || 1,
				total_price,
				special_requests: notes || null,
				status: 'pending',
				requires_deposit: requiresDeposit,
				deposit_paid: false,
			},
			{ transaction: t }
		);

		// Create deposit payment record if required
		if (requiresDeposit) {
			await Payment.create(
				{
					booking_id: booking.id,
					amount: depositAmount,
					payment_method: 'bank_transfer', // Deposit must be paid online
					payment_type: 'deposit',
					deposit_percentage: depositPercentage,
					payment_status: 'pending',
					notes: `Deposit payment (${depositPercentage}%) for booking ${bookingNumber}`,
				},
				{ transaction: t }
			);
		}

		await t.commit();

		// Fetch booking with payment info
		const bookingWithPayments = await Booking.findByPk(booking.id, {
			include: [
				{ model: Room, as: 'room', include: [{ model: RoomType, as: 'room_type' }] },
				{ model: Payment, as: 'payments' },
			],
		});

		return res.status(201).json({
			success: true,
			data: {
				booking: bookingWithPayments,
			},
			message: requiresDeposit
				? `Booking created. Please pay ${depositPercentage}% deposit to confirm.`
				: 'Booking created successfully',
		});
	} catch (error) {
		await t.rollback();
		next(error);
	}
};

/**
 * Get bookings for current user
 * GET /api/bookings/me
 */
const getMyBookings = async (req, res, next) => {
	try {
		const user = req.user;
		const bookings = await Booking.findAll({
			where: { user_id: user.id },
			include: [
				{
					model: Room,
					as: 'room',
					include: [{ model: RoomType, as: 'room_type' }],
				},
			],
			order: [['created_at', 'DESC']],
		});

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
		const booking = await Booking.findByPk(id, {
			include: [
				{ model: Room, as: 'room', include: [{ model: RoomType, as: 'room_type' }] },
				{ model: Payment, as: 'payments' },
			],
		});

			if (!booking) {
				return res.status(404).json({ success: false, message: 'Booking not found' });
			}

		// If user is not owner, restrict access (admins may be allowed later)
		if (req.user && booking.user_id !== req.user.id) {
			return res.status(403).json({ status: 'error', message: 'Forbidden' });
		}

		res.status(200).json({ success: true, data: { booking } });
	} catch (error) {
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
		const booking = await Booking.findByPk(id);

		if (!booking) {
			return res.status(404).json({ success: false, message: 'Booking not found' });
		}

		if (booking.user_id !== req.user.id) {
			return res.status(403).json({ status: 'error', message: 'Forbidden' });
		}

		if (booking.status === 'cancelled') {
			return res.status(400).json({ status: 'error', message: 'Booking already cancelled' });
		}

		booking.status = 'cancelled';
		await booking.save();

		res.status(200).json({ success: true, data: { booking } });
	} catch (error) {
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
		const booking = await Booking.findOne({
			where: { booking_number: bookingNumber },
			include: [{ model: Room, as: 'room' }],
		});

		if (!booking) {
			return res.status(404).json({ status: 'error', message: 'Booking not found' });
		}

		res.status(200).json({ status: 'success', data: { booking } });
	} catch (error) {
		next(error);
	}
};

module.exports = {
	createBooking,
	getMyBookings,
	getBookingById,
	cancelBooking,
	checkBookingByNumber,
};
