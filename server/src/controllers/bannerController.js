const { Banner } = require('../databases/models');
const { Op } = require('sequelize');

/**
 * Get all banners with filters
 */
const getBanners = async (req, res, next) => {
  try {
    const { position } = req.query;

    const whereClause = {
      is_active: true,
    };

    // Filter by position if provided
    if (position) {
      whereClause.position = position;
    }

    // Get current date for filtering active banners
    const now = new Date();
    whereClause[Op.or] = [
      { start_date: null },
      { start_date: { [Op.lte]: now } },
    ];
    whereClause[Op.and] = [
      {
        [Op.or]: [
          { end_date: null },
          { end_date: { [Op.gte]: now } },
        ],
      },
    ];

    const banners = await Banner.findAll({
      where: whereClause,
      order: [
        ['display_order', 'ASC'],
        ['created_at', 'DESC'],
      ],
    });

    res.status(200).json({
      status: 'success',
      data: {
        banners,
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
        status: 'error',
        message: 'Banner not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        banner,
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
      image_url,
      link,
      position,
      display_order,
      start_date,
      end_date,
    } = req.body;

    const banner = await Banner.create({
      title,
      image_url,
      link,
      position: position || 'home',
      display_order: display_order || 0,
      is_active: true,
      start_date,
      end_date,
    });

    res.status(201).json({
      status: 'success',
      message: 'Banner created successfully',
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
      image_url,
      link,
      position,
      display_order,
      is_active,
      start_date,
      end_date,
    } = req.body;

    const banner = await Banner.findByPk(id);

    if (!banner) {
      return res.status(404).json({
        status: 'error',
        message: 'Banner not found',
      });
    }

    await banner.update({
      title,
      image_url,
      link,
      position,
      display_order,
      is_active,
      start_date,
      end_date,
    });

    res.status(200).json({
      status: 'success',
      message: 'Banner updated successfully',
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
        status: 'error',
        message: 'Banner not found',
      });
    }

    await banner.destroy();

    res.status(200).json({
      status: 'success',
      message: 'Banner deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
};
