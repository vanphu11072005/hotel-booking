const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/bannerController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for banner image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/banners';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'banner-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept images only
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file ảnh (jpeg, jpg, png, gif, webp)'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: fileFilter,
});

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
router.post(
  '/:id/image',
  authenticateToken,
  authorizeRoles('admin'),
  upload.single('image'),
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
