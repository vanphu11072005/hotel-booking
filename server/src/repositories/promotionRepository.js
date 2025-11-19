const { Promotion } = require('../databases/models');
const { Op } = require('sequelize');

/**
 * Promotion Repository - Data access layer
 * Xử lý tất cả các truy vấn database liên quan đến promotion
 */
class PromotionRepository {
  /**
   * Find all promotions with filters
   */
  async findAllPromotions(whereClause, limit, offset) {
    const { count, rows } = await Promotion.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['created_at', 'DESC']],
    });

    return { promotions: rows, count };
  }

  /**
   * Find promotion by ID
   */
  async findPromotionById(id) {
    return await Promotion.findByPk(id);
  }

  /**
   * Find promotion by code
   */
  async findPromotionByCode(code) {
    return await Promotion.findOne({ where: { code } });
  }

  /**
   * Find promotion by code excluding specific ID
   */
  async findPromotionByCodeExcludingId(code, excludeId) {
    return await Promotion.findOne({
      where: {
        code,
        id: { [Op.ne]: excludeId },
      },
    });
  }

  /**
   * Create a new promotion
   */
  async createPromotion(promotionData) {
    return await Promotion.create(promotionData);
  }

  /**
   * Update a promotion
   */
  async updatePromotion(promotion, updateData) {
    return await promotion.update(updateData);
  }

  /**
   * Delete a promotion
   */
  async deletePromotion(promotion) {
    return await promotion.destroy();
  }

  /**
   * Build where clause for promotion filters
   */
  buildWhereClause(filters) {
    const { search, status, type } = filters;
    const whereClause = {};

    // Filter by search (code or name)
    if (search) {
      whereClause[Op.or] = [
        { code: { [Op.like]: `%${search}%` } },
        { name: { [Op.like]: `%${search}%` } },
      ];
    }

    // Filter by status
    if (status) {
      if (status === 'active') {
        whereClause.is_active = true;
      } else if (status === 'inactive') {
        whereClause.is_active = false;
      }
    }

    // Filter by type
    if (type) {
      whereClause.discount_type = type;
    }

    return whereClause;
  }
}

// Export singleton instance
module.exports = new PromotionRepository();
