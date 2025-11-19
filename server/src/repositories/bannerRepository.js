const { Banner } = require('../databases/models');
const { Op } = require('sequelize');

/**
 * Banner Repository - Data access layer
 * Xử lý các thao tác database liên quan đến banner
 */
class BannerRepository {
  /**
   * Tìm tất cả banners với filters và pagination
   */
  async findAllBanners(whereClause, limit, offset) {
    return await Banner.findAndCountAll({
      where: whereClause,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  }

  /**
   * Tìm banner theo ID
   */
  async findBannerById(id) {
    return await Banner.findByPk(id);
  }

  /**
   * Tạo banner mới
   */
  async createBanner(bannerData) {
    return await Banner.create(bannerData);
  }

  /**
   * Cập nhật banner
   */
  async updateBanner(banner, updateData) {
    return await banner.update(updateData);
  }

  /**
   * Xóa banner
   */
  async deleteBanner(banner) {
    return await banner.destroy();
  }

  /**
   * Build where clause cho tìm kiếm
   */
  buildWhereClause(search, status) {
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

    return whereClause;
  }
}

module.exports = new BannerRepository();
