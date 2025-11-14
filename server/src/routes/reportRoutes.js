const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

/**
 * GET /api/reports/dashboard - Get dashboard statistics (Admin/Staff)
 */
router.get(
  '/dashboard',
  authenticateToken,
  authorizeRoles('admin', 'staff'),
  reportController.getDashboardStats
);

/**
 * GET /api/reports - Get detailed reports (Admin/Staff)
 */
router.get(
  '/',
  authenticateToken,
  authorizeRoles('admin', 'staff'),
  reportController.getReports
);

/**
 * GET /api/reports/export - Export report to CSV (Admin/Staff)
 */
router.get(
  '/export',
  authenticateToken,
  authorizeRoles('admin', 'staff'),
  reportController.exportReport
);

module.exports = router;
