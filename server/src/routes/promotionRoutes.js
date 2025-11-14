const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotionController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

/**
 * GET /api/promotions - Get all promotions (Admin/Staff)
 */
router.get(
  '/',
  authenticateToken,
  authorizeRoles('admin', 'staff'),
  promotionController.getPromotions
);

/**
 * GET /api/promotions/:id - Get promotion by ID (Admin/Staff)
 */
router.get(
  '/:id',
  authenticateToken,
  authorizeRoles('admin', 'staff'),
  promotionController.getPromotionById
);

/**
 * POST /api/promotions - Create new promotion (Admin)
 */
router.post(
  '/',
  authenticateToken,
  authorizeRoles('admin'),
  promotionController.createPromotion
);

/**
 * PUT /api/promotions/:id - Update promotion (Admin)
 */
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('admin'),
  promotionController.updatePromotion
);

/**
 * DELETE /api/promotions/:id - Delete promotion (Admin)
 */
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('admin'),
  promotionController.deletePromotion
);

/**
 * POST /api/promotions/validate - Validate and apply promotion code (Authenticated)
 */
router.post(
  '/validate',
  authenticateToken,
  promotionController.validatePromotion
);

module.exports = router;
