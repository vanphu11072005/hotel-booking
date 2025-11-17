const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateToken } = require('../middlewares/auth');

/**

 * Payment Routes
 * All routes require authentication
 */

// Lấy danh sách tất cả payment (cho admin)
router.get(
	'/',
	authenticateToken,
	paymentController.getAllPayments
);

// Get payments for a booking
router.get(
	'/booking/:bookingId',
	authenticateToken,
	paymentController.getPaymentByBookingId
);

// Get bank transfer info (QR code)
router.get(
	'/:paymentId/bank-info',
	authenticateToken,
	paymentController.getBankTransferInfo
);

// Confirm deposit payment
router.post(
	'/confirm-deposit',
	authenticateToken,
	paymentController.confirmDepositPayment
);

// Notify payment completion
router.post(
	'/notify',
	authenticateToken,
	paymentController.notifyPayment
);

// (VNPay integration removed) — VNPay-related routes deleted

module.exports = router;
