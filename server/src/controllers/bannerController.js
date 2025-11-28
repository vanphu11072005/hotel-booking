const bannerService = require('../services/bannerService');

/**
 * Get all banners with filters and pagination
 */
const getBanners = async (req, res, next) => {
  try {
    const filters = req.query;

    // Get banners from service
    const result = await bannerService.getBanners(filters);

    // Format image URLs to absolute URLs
    const baseUrl = process.env.SERVER_URL || `http://${req.get('host')}`;
    const mappedBanners = bannerService.formatBannersImageUrls(
      result.banners,
      baseUrl
    );

    res.status(200).json({
      success: true,
      data: {
        banners: mappedBanners,
        pagination: result.pagination,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get banner by ID
 */
const getBannerById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get banner from service
    const banner = await bannerService.getBannerById(id);

    // Format image URL to absolute URL
    const baseUrl = process.env.SERVER_URL || `http://${req.get('host')}`;
    const formattedBanner = bannerService.formatImageUrl(banner, baseUrl);

    res.status(200).json({
      success: true,
      data: {
        banner: formattedBanner,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new banner (Admin only)
 */
const createBanner = async (req, res, next) => {
  try {
    const bannerData = req.body;

    // Create banner via service
    const banner = await bannerService.createBanner(bannerData);

    res.status(201).json({
      success: true,
      message: 'Thêm banner thành công',
      data: {
        banner,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update banner (Admin only)
 */
const updateBanner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Update banner via service
    const banner = await bannerService.updateBanner(id, updateData);

    res.status(200).json({
      success: true,
      message: 'Cập nhật banner thành công',
      data: {
        banner,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete banner (Admin only)
 */
const deleteBanner = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Delete banner via service
    await bannerService.deleteBanner(id);

    res.status(200).json({
      success: true,
      message: 'Xóa banner thành công',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload banner image
 */
const uploadBannerImage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const file = req.file;

    // Upload image via service
    const banner = await bannerService.uploadBannerImage(id, file);

    res.status(200).json({
      success: true,
      message: 'Upload ảnh thành công',
      data: {
        banner,
      },
    });
  } catch (error) {
    console.error('uploadBannerImage error:', error);
    // Clean up uploaded file on error
    if (req.file) {
      bannerService.cleanupUploadedFile(req.file.filename);
    }
    next(error);
  }
};

module.exports = {
  getBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
  uploadBannerImage,
};
