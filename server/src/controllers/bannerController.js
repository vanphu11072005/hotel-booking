const { Banner } = require('../databases/models');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

/**
 * Get all banners with filters and pagination
 */
const getBanners = async (req, res, next) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;

    const whereClause = {};

    // Search by title
    if (search) {
      whereClause.title = {
        [Op.like]: `%${search}%`,
      };
    }

    // Filter by status
    if (status === 'active') {
      whereClause.is_active = true;
    } else if (status === 'inactive') {
      whereClause.is_active = false;
    }

    // Calculate offset
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get banners with pagination
    const { count, rows: banners } = await Banner.findAndCountAll({
      where: whereClause,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: offset,
    });

    const totalPages = Math.ceil(count / parseInt(limit));

    // Ensure image_url is absolute so frontend can load directly
    const baseUrl = process.env.SERVER_URL || `http://${req.get('host')}`;
    const mapped = banners.map((b) => {
      const obj = b.toJSON ? b.toJSON() : b;
      if (obj.image_url && !/^https?:\/\//i.test(obj.image_url)) {
        obj.image_url = obj.image_url.startsWith('/')
          ? `${baseUrl}${obj.image_url}`
          : `${baseUrl}/${obj.image_url}`;
      }
      return obj;
    });

    res.status(200).json({
      success: true,
      data: {
        banners,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages,
        },
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

    const banner = await Banner.findByPk(id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner không tồn tại',
      });
    }

    // Prefix image_url to full URL for client convenience
    const baseUrl = process.env.SERVER_URL || `http://${req.get('host')}`;
    const out = banner.toJSON ? banner.toJSON() : banner;
    if (out.image_url && !/^https?:\/\//i.test(out.image_url)) {
      out.image_url = out.image_url.startsWith('/')
        ? `${baseUrl}${out.image_url}`
        : `${baseUrl}/${out.image_url}`;
    }

    res.status(200).json({
      success: true,
      data: {
        banner: out,
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
    const {
      title,
      description,
      link_url,
      is_active = true,
    } = req.body;

    const banner = await Banner.create({
      title,
      description,
      link_url,
      is_active,
    });

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
    const {
      title,
      description,
      link_url,
      is_active,
    } = req.body;

    const banner = await Banner.findByPk(id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner không tồn tại',
      });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (link_url !== undefined) updateData.link_url = link_url;
    if (is_active !== undefined) updateData.is_active = is_active;

    await banner.update(updateData);

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

    const banner = await Banner.findByPk(id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner không tồn tại',
      });
    }

    // Delete image file if exists
    if (banner.image_url) {
      const imagePath = path.join(__dirname, '../../', banner.image_url);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await banner.destroy();

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
    
    const banner = await Banner.findByPk(id);
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner không tồn tại',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn file ảnh',
      });
    }

    // Delete old image if exists
    if (banner.image_url) {
      const oldImagePath = path.join(__dirname, '../../', banner.image_url);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Update banner with new image URL
    const imageUrl = `/uploads/banners/${req.file.filename}`;
    await banner.update({ image_url: imageUrl });

    res.status(200).json({
      success: true,
      message: 'Upload ảnh thành công',
      data: {
        banner,
      },
    });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file) {
      const filePath = path.join(__dirname, '../../uploads/banners', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
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
