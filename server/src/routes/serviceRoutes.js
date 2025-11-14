const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

/**
 * GET /api/services - Get all services
 */
router.get('/', serviceController.getServices);

/**
 * GET /api/services/:id - Get service by ID
 */
router.get('/:id', serviceController.getServiceById);

/**
 * POST /api/services - Create new service (Admin/Staff)
 */
router.post(
  '/',
  authenticateToken,
  authorizeRoles('admin', 'staff'),
  serviceController.createService
);

/**
 * PUT /api/services/:id - Update service (Admin/Staff)
 */
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('admin', 'staff'),
  serviceController.updateService
);

/**
 * DELETE /api/services/:id - Delete service (Admin)
 */
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('admin'),
  serviceController.deleteService
);

/**
 * POST /api/services/use - Add service to booking (Admin/Staff)
 */
router.post(
  '/use',
  authenticateToken,
  authorizeRoles('admin', 'staff'),
  serviceController.useService
);

module.exports = router;
