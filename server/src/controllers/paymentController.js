const paymentService = require('../services/paymentService');

/**
 * Get payment details for a booking
 * GET /api/payments/booking/:bookingId
 */
const getPaymentByBookingId = async (req, res, next) => {
	try {
		const { bookingId } = req.params;
		const result = await paymentService.getPaymentByBookingId(
			bookingId,
			req.user.id
		);

		return res.status(200).json({
			success: true,
			data: result,
		});
	} catch (error) {
		if (error.statusCode) {
			return res.status(error.statusCode).json({ 
				success: false,
				message: error.message 
			});
		}
		next(error);
	}
};

/**
 * Confirm deposit payment: client sends payment_id and optional txn id
 * POST /api/payments/confirm-deposit
 */
const confirmDepositPayment = async (req, res, next) => {
	try {
		const result = await paymentService.confirmDepositPayment(
			req.user.id,
			req.body
		);

		return res.status(200).json({ success: true, data: result });
	} catch (error) {
		if (error.statusCode) {
			return res.status(error.statusCode).json({ 
				success: false,
				message: error.message 
			});
		}
		next(error);
	}
};

/**
 * Return bank transfer info for a pending deposit payment
 * GET /api/payments/:paymentId/bank-info
 */
const getBankTransferInfo = async (req, res, next) => {
	try {
		const paymentId = parseInt(req.params.paymentId, 10);
		const result = await paymentService.getBankTransferInfo(
			paymentId,
			req.user.id
		);

		return res.status(200).json({ success: true, data: result });
	} catch (error) {
		if (error.statusCode) {
			return res.status(error.statusCode).json({ 
				success: false,
				message: error.message 
			});
		}
		next(error);
	}
};

/**
 * Notify admin / system that customer has paid and requests manual verify
 * POST /api/payments/notify
 */
const notifyPayment = async (req, res, next) => {
	try {
		await paymentService.notifyPayment(req.user.id, req.body);
		return res.status(200).json({ success: true, message: 'Notified' });
	} catch (error) {
		if (error.statusCode) {
			return res.status(error.statusCode).json({ 
				success: false,
				message: error.message 
			});
		}
		next(error);
	}
};

/**
 * Tạo URL thanh toán VNPay
 * POST /api/payments/vnpay/create
 */
const createVNPayPayment = async (req, res, next) => {
	try {
		const result = await paymentService.createVNPayPayment(
			req.user.id,
			req.body,
			req
		);

		return res.status(200).json({
			success: true,
			data: result,
		});
	} catch (error) {
		if (error.statusCode) {
			return res.status(error.statusCode).json({
				success: false,
				message: error.message,
			});
		}
		console.error('Error creating VNPay payment:', error);
		next(error);
	}
};

/**
 * Xử lý callback từ VNPay
 * GET /api/payments/vnpay/return
 */
const handleVNPayReturn = async (req, res, next) => {
	try {
		const result = await paymentService.handleVNPayReturn(req.query);

		return res.status(200).json({
			success: true,
			message: result.message,
			data: {
				payment: result.payment,
				booking: result.booking,
			},
		});
	} catch (error) {
		if (error.statusCode) {
			return res.status(error.statusCode).json({
				success: false,
				message: error.message,
				code: error.code,
				data: error.payment ? { payment: error.payment } : undefined,
			});
		}
		console.error('Error handling VNPay return:', error);
		next(error);
	}
};

/**
 * Lấy danh sách tất cả payment (cho admin)
 * GET /api/payments?search=&method=&from=&to=&page=1&limit=5
 */
const getAllPayments = async (req, res, next) => {
	try {
		const result = await paymentService.getAllPayments(req.query);

		return res.status(200).json({
			success: true,
			data: result,
		});
	} catch (error) {
		console.error('getAllPayments error:', error);
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
	getAllPayments,
};
