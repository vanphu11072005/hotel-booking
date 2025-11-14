const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

/**
 * GET /api/payments - Get all payments (Admin/Staff)
 */
router.get(
  '/',
  authenticateToken,
  authorizeRoles('admin', 'staff'),
  paymentController.getPayments
);

/**
 * GET /api/payments/:id - Get payment by ID (Admin/Staff)
 */
router.get(
  '/:id',
  authenticateToken,
  authorizeRoles('admin', 'staff'),
  paymentController.getPaymentById
);

module.exports = router;
