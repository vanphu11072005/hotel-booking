const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/bannerController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

/**
 * Banner Routes
 */

// Public routes
router.get('/', bannerController.getBanners);
router.get('/:id', bannerController.getBannerById);

// Admin routes
router.post(
  '/',
  authenticateToken,
  authorizeRoles('admin'),
  bannerController.createBanner
);
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('admin'),
  bannerController.updateBanner
);
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('admin'),
  bannerController.deleteBanner
);

module.exports = router;
