const { Payment, Booking, Room, RoomType } = require('../databases/models');

// VNPay integration removed

/**
 * Get payment details for a booking
 * GET /api/payments/booking/:bookingId
 */
const getPaymentByBookingId = async (req, res, next) => {
	try {
		const { bookingId } = req.params;
		const user = req.user;

		const booking = await Booking.findByPk(bookingId, {
			include: [{ model: Payment, as: 'payments' }],
		});

		if (!booking) {
			return res.status(404).json({
				status: 'error',
				message: 'Booking not found',
			});
		}

		// Check if user owns this booking
		if (booking.user_id !== user.id) {
			return res.status(403).json({
				status: 'error',
				message: 'Forbidden',
			});
		}

		res.status(200).json({
			success: true,
			data: {
				payments: booking.payments,
			},
		});
	} catch (error) {
		next(error);
	}
};

/**
 * Confirm deposit payment (after customer pays via bank transfer/online gateway)
 * POST /api/payments/confirm-deposit
 */
const confirmDepositPayment = async (req, res, next) => {
	try {
		const { payment_id, transaction_id } = req.body;
		const user = req.user;

		if (!payment_id) {
			return res.status(400).json({
				status: 'error',
				message: 'Payment ID is required',
			});
		}

		const payment = await Payment.findByPk(payment_id, {
			include: [
				{
					model: Booking,
					as: 'booking',
					include: [{ model: Room, as: 'room', include: [{ model: RoomType, as: 'room_type' }] }],
				},
			],
		});

		if (!payment) {
			return res.status(404).json({
				status: 'error',
				message: 'Payment not found',
			});
		}

		const booking = payment.booking;

		// Check ownership
		if (booking.user_id !== user.id) {
			return res.status(403).json({
				status: 'error',
				message: 'Forbidden',
			});
		}

		// Check if payment is already completed
		if (payment.payment_status === 'completed') {
			return res.status(400).json({
				status: 'error',
				message: 'Payment already completed',
			});
		}

		// Update payment status
		payment.payment_status = 'completed';
		payment.payment_date = new Date();
		if (transaction_id) {
			payment.transaction_id = transaction_id;
		}
		await payment.save();

		// Update booking if this is a deposit
		if (payment.payment_type === 'deposit') {
			booking.deposit_paid = true;
			booking.status = 'confirmed';
			await booking.save();
		}

		res.status(200).json({
			success: true,
			data: {
				payment,
				booking,
			},
			message: 'Deposit payment confirmed successfully',
		});
	} catch (error) {
		next(error);
	}
};

/**
 * Generate payment info for bank transfer (QR code data)
 * GET /api/payments/:paymentId/bank-info
 */
const getBankTransferInfo = async (req, res, next) => {
	try {
		const { paymentId } = req.params;
		const user = req.user;

		const payment = await Payment.findByPk(paymentId, {
			include: [{ model: Booking, as: 'booking' }],
		});

		if (!payment) {
			return res.status(404).json({
				status: 'error',
				message: 'Payment not found',
			});
		}

		// Check ownership
		if (payment.booking.user_id !== user.id) {
			return res.status(403).json({
				status: 'error',
				message: 'Forbidden',
			});
		}

		// Bank information (replace with actual bank details)
		const bankInfo = {
			bank_name: 'Vietcombank',
			bank_code: 'VCB',
			account_number: '0123456789',
			account_name: 'KHACH SAN ABC',
			amount: parseFloat(payment.amount),
			content: `${payment.booking.booking_number}`,
			qr_url: generateQRCodeURL(
				'VCB',
				'0123456789',
				'KHACH SAN ABC',
				payment.booking.booking_number,
				parseFloat(payment.amount)
			),
		};

		res.status(200).json({
			success: true,
			data: {
				payment,
				bank_info: bankInfo,
			},
		});
	} catch (error) {
		next(error);
	}
};

/**
 * Helper function to generate VietQR URL
 */
const generateQRCodeURL = (bankCode, accountNumber, accountName, content, amount) => {
	const baseUrl = 'https://img.vietqr.io/image';
	const qrUrl =
		`${baseUrl}/${bankCode}-${accountNumber}-compact2.jpg?` +
		`amount=${amount}&` +
		`addInfo=${encodeURIComponent(content)}&` +
		`accountName=${encodeURIComponent(accountName)}`;
	return qrUrl;
};

/**
 * Notify payment completion (for manual verification by admin)
 * POST /api/payments/notify
 */
const notifyPayment = async (req, res, next) => {
	try {
		const { payment_id, notes } = req.body;
		const user = req.user;

		const payment = await Payment.findByPk(payment_id, {
			include: [{ model: Booking, as: 'booking' }],
		});

		if (!payment) {
			return res.status(404).json({
				status: 'error',
				message: 'Payment not found',
			});
		}

		// Check ownership
		if (payment.booking.user_id !== user.id) {
			return res.status(403).json({
				status: 'error',
				message: 'Forbidden',
			});
		}

		// Update payment notes (for admin review)
		payment.notes = notes || 'Customer notified payment completion';
		await payment.save();

		res.status(200).json({
			success: true,
			message: 'Payment notification sent. Please wait for admin verification.',
		});
	} catch (error) {
		next(error);
	}
};

module.exports = {
	getPaymentByBookingId,
	confirmDepositPayment,
	getBankTransferInfo,
	notifyPayment,
};
