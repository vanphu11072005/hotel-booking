const { Payment, Booking, Room, RoomType, User } = require('../databases/models');
const vnpayService = require('../utils/vnpayService');

// Remove diacritics and non-ASCII characters from strings
const asciiOnly = (str = '') =>
	str
		.normalize('NFD')
		.replace(/[-]/g, (m) => m)
		.replace(/[-]/g, '')
		.trim();

/**
 * Get payment details for a booking
 * GET /api/payments/booking/:bookingId
 */
const getPaymentByBookingId = async (req, res, next) => {
	try {
		const { bookingId } = req.params;
		const user = req.user;

		const booking = await Booking.findByPk(bookingId, {
			include: [
				{ model: Payment, as: 'payments' },
				{
					model: require('../databases/models').ServiceUsage,
					as: 'service_usages',
					include: [
						{
							model: require('../databases/models').Service,
							as: 'service'
						}
					]
				}
			],
		});

		if (!booking) return res.status(404).json({ success: false });

		if (booking.user_id !== user.id)
			return res.status(403).json({ success: false });

		return res.status(200).json({
			success: true,
			data: {
				payments: booking.payments,
				service_usages: booking.service_usages
			},
		});
	} catch (error) {
		next(error);
	}
};

/**
 * Confirm deposit payment: client sends payment_id and optional txn id
 * POST /api/payments/confirm-deposit
 */
const confirmDepositPayment = async (req, res, next) => {
	try {
		const user = req.user;
		const { payment_id, transaction_id } = req.body;

		if (!payment_id)
			return res.status(400).json({ success: false, message: 'Missing id' });

		const payment = await Payment.findByPk(payment_id, {
			include: [{ model: Booking, as: 'booking' }],
		});

		if (!payment) return res.status(404).json({ success: false });

		const booking = payment.booking;
		if (!booking || booking.user_id !== user.id)
			return res.status(403).json({ success: false });

		payment.transaction_id = transaction_id || payment.transaction_id;
		payment.payment_status = 'completed';
		payment.payment_date = new Date();
		await payment.save();

		// mark booking deposit as paid
		booking.deposit_paid = true;
		await booking.save();

		return res.status(200).json({ success: true, data: { payment, booking } });
	} catch (error) {
		next(error);
	}
};

/**
 * Return bank transfer info for a pending deposit payment
 * GET /api/payments/:paymentId/bank-info
 */
const getBankTransferInfo = async (req, res, next) => {
	try {
		const user = req.user;
		const paymentId = parseInt(req.params.paymentId, 10);

		const payment = await Payment.findByPk(paymentId, {
			include: [{ model: Booking, as: 'booking' }],
		});

		if (!payment) return res.status(404).json({ success: false });
		if (!payment.booking || payment.booking.user_id !== user.id)
			return res.status(403).json({ success: false });

		const content = `DEP:${payment.booking.booking_number}:${payment.id}`;
		const amount = parseFloat(payment.amount);

		const bankInfo = {
			bank_name: process.env.BANK_NAME || 'Example Bank',
			bank_code: process.env.BANK_CODE || 'EXB',
			account_number: process.env.BANK_ACCOUNT || '0123456789',
			account_name: process.env.BANK_ACCOUNT_NAME || 'Hotel Booking',
			amount,
			content,
			qr_url: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
				content
			)}`,
		};

		return res.status(200).json({ success: true, data: { payment, bank_info: bankInfo } });
	} catch (error) {
		next(error);
	}
};

/**
 * Notify admin / system that customer has paid and requests manual verify
 * POST /api/payments/notify
 */
const notifyPayment = async (req, res, next) => {
	try {
		const user = req.user;
		const { payment_id, notes } = req.body;

		if (!payment_id)
			return res.status(400).json({ success: false, message: 'Missing id' });

		const payment = await Payment.findByPk(payment_id, {
			include: [{ model: Booking, as: 'booking' }],
		});

		if (!payment) return res.status(404).json({ success: false });
		if (!payment.booking || payment.booking.user_id !== user.id)
			return res.status(403).json({ success: false });

		payment.notes = notes || payment.notes;
		payment.payment_status = 'pending';
		await payment.save();

		// In a real app we would enqueue a notification for staff here
		return res.status(200).json({ success: true, message: 'Notified' });
	} catch (error) {
		next(error);
	}
};

/**
 * Create VNPay payment URL
 * POST /api/payments/vnpay/create
 */
const createVNPayPayment = async (req, res, next) => {
	try {
		const user = req.user;
		const { payment_id, return_url } = req.body;

		if (!payment_id) {
			return res.status(400).json({ 
				success: false, 
				message: 'Missing payment_id' 
			});
		}

		const payment = await Payment.findByPk(payment_id, {
			include: [{ model: Booking, as: 'booking' }],
		});

		if (!payment) {
			return res.status(404).json({ 
				success: false, 
				message: 'Payment not found' 
			});
		}

		if (!payment.booking || payment.booking.user_id !== user.id) {
			return res.status(403).json({ 
				success: false, 
				message: 'Unauthorized' 
			});
		}

		if (payment.payment_status === 'completed') {
			return res.status(400).json({ 
				success: false, 
				message: 'Payment already completed' 
			});
		}

		// Get client IP
		const ipAddr = req.headers['x-forwarded-for'] || 
		               req.connection.remoteAddress || 
		               req.socket.remoteAddress || 
		               '127.0.0.1';

		// Create VNPay payment URL
		const paymentUrl = vnpayService.createPaymentUrl({
			amount: parseFloat(payment.amount),
			orderInfo: `Thanh toan dat coc ${payment.booking.booking_number}`,
			orderId: `${payment.booking.booking_number}-${payment.id}`,
			ipAddr: ipAddr.split(':').pop(), // Remove IPv6 prefix if present
			returnUrl: return_url,
		});

		return res.status(200).json({
			success: true,
			data: {
				payment_url: paymentUrl,
				payment_id: payment.id,
			},
		});
	} catch (error) {
		console.error('Error creating VNPay payment:', error);
		next(error);
	}
};

/**
 * Handle VNPay return
 * GET /api/payments/vnpay/return
 */
const handleVNPayReturn = async (req, res, next) => {
	try {
		const vnpParams = req.query;

		// Verify signature
		const verifyResult = vnpayService.verifyReturn(vnpParams);

		if (!verifyResult.isValid) {
			return res.status(400).json({
				success: false,
				message: 'Invalid signature',
			});
		}

		const { orderId, responseCode, transactionNo, amount } = verifyResult.data;

		// Extract payment_id from orderId (format: BOOKING_NUMBER-PAYMENT_ID)
		const paymentId = orderId.split('-').pop();

		const payment = await Payment.findByPk(paymentId, {
			include: [{ model: Booking, as: 'booking' }],
		});

		if (!payment) {
			return res.status(404).json({
				success: false,
				message: 'Payment not found',
			});
		}

		// Check response code (00 = success)
		if (responseCode === '00') {
			// Payment successful
			payment.payment_status = 'completed';
			payment.payment_date = new Date();
			payment.transaction_id = transactionNo;
			payment.payment_method = 'vnpay';
			await payment.save();

			// Mark booking deposit as paid
			if (payment.booking) {
				payment.booking.deposit_paid = true;
				await payment.booking.save();
			}

			return res.status(200).json({
				success: true,
				message: 'Payment successful',
				data: {
					payment,
					booking: payment.booking,
				},
			});
		} else {
			// Payment failed
			payment.payment_status = 'failed';
			payment.notes = `VNPay error: ${responseCode}`;
			await payment.save();

			return res.status(400).json({
				success: false,
				message: 'Payment failed',
				code: responseCode,
				data: { payment },
			});
		}
	} catch (error) {
		console.error('Error handling VNPay return:', error);
		next(error);
	}
};

module.exports = {
	getPaymentByBookingId,
	confirmDepositPayment,
	getBankTransferInfo,
	notifyPayment,
	createVNPayPayment,
	handleVNPayReturn,
	/**
	 * Lấy danh sách tất cả payment (cho admin)
	 * GET /api/payments?search=&method=&from=&to=&page=1&limit=5
	 */
	getAllPayments: async (req, res, next) => {
		try {
			const { search = '', method = '', from = '', to = '', payment_status = '', page = 1, limit = 5 } = req.query;
			const offset = (parseInt(page) - 1) * parseInt(limit);
			const where = {};

			const { Op } = require('sequelize');
			if (search) {
				where["$booking.booking_number$"] = { [Op.like]: `%${search}%` };
			}
			if (method) {
				where.payment_method = method;
			}
			if (from && to) {
				where.payment_date = { $between: [new Date(from), new Date(to)] };
			}
			if (payment_status) {
				where.payment_status = payment_status;
			}

			const { rows, count } = await Payment.findAndCountAll({
				where,
				include: [
					{
						model: Booking,
						as: 'booking',
						include: [
							{ model: Room, as: 'room', include: [{ model: RoomType, as: 'room_type' }] },
							{ model: User, as: 'user' }
						]
					}
				],
				order: [['payment_date', 'DESC']],
				offset,
				limit: parseInt(limit)
			});

			return res.status(200).json({
				success: true,
				data: {
					payments: rows,
					pagination: {
						total: count,
						totalPages: Math.ceil(count / limit),
						currentPage: parseInt(page)
					}
				}
			});
		} catch (error) {
			console.error('getAllPayments error:', error);
			next(error);
		}
	},
};
