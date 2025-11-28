const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/bannerController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

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
router.post(
  '/:id/image',
  authenticateToken,
  authorizeRoles('admin'),
  upload.uploadBanner.single('image'),
  bannerController.uploadBannerImage
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
