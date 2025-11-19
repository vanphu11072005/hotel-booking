const promotionRepository = require('../repositories/promotionRepository');

/**
 * Promotion Service - Business logic layer
 * Xử lý logic nghiệp vụ liên quan đến promotion
 */
class PromotionService {
  /**
   * Get all promotions with filters and pagination
   */
  async getPromotions(filters) {
    const { page = 1, limit = 10 } = filters;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const whereClause = promotionRepository.buildWhereClause(filters);

    const { promotions, count } = 
      await promotionRepository.findAllPromotions(
        whereClause,
        parseInt(limit),
        offset
      );

    return {
      promotions,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit)),
      },
    };
  }

  /**
   * Get promotion by ID
   */
  async getPromotionById(id) {
    const promotion = await promotionRepository.findPromotionById(id);

    if (!promotion) {
      throw { statusCode: 404, message: 'Promotion not found' };
    }

    return promotion;
  }

  /**
   * Validate promotion data
   */
  validatePromotionData(discountType, discountValue) {
    if (discountType === 'percentage' && discountValue > 100) {
      throw {
        statusCode: 400,
        message: 'Percentage discount cannot exceed 100%',
      };
    }
  }

  /**
   * Create new promotion
   */
  async createPromotion(promotionData) {
    const {
      code,
      name,
      description,
      discount_type,
      discount_value,
      min_booking_amount,
      max_discount_amount,
      start_date,
      end_date,
      usage_limit,
      status = 'active',
    } = promotionData;

    // Check if promotion code already exists
    const existingPromotion = 
      await promotionRepository.findPromotionByCode(code);

    if (existingPromotion) {
      throw {
        statusCode: 400,
        message: 'Promotion code already exists',
      };
    }

    // Validate discount value
    this.validatePromotionData(discount_type, discount_value);

    const promotion = await promotionRepository.createPromotion({
      code,
      name,
      description,
      discount_type,
      discount_value,
      min_booking_amount,
      max_discount_amount,
      start_date,
      end_date,
      usage_limit,
      used_count: 0,
      is_active: status === 'active' ? true : false,
    });

    return promotion;
  }

  /**
   * Update promotion
   */
  async updatePromotion(id, updateData) {
    const {
      code,
      name,
      description,
      discount_type,
      discount_value,
      min_booking_amount,
      max_discount_amount,
      start_date,
      end_date,
      usage_limit,
      status,
    } = updateData;

    const promotion = await promotionRepository.findPromotionById(id);

    if (!promotion) {
      throw { statusCode: 404, message: 'Promotion not found' };
    }

    // Check if new code already exists (excluding current promotion)
    if (code && code !== promotion.code) {
      const existingPromotion = 
        await promotionRepository.findPromotionByCodeExcludingId(code, id);

      if (existingPromotion) {
        throw {
          statusCode: 400,
          message: 'Promotion code already exists',
        };
      }
    }

    // Validate discount value
    if (discount_type && discount_value !== undefined) {
      this.validatePromotionData(discount_type, discount_value);
    }

    // Build update data
    const updatePayload = {};
    if (code !== undefined) updatePayload.code = code;
    if (name !== undefined) updatePayload.name = name;
    if (description !== undefined) updatePayload.description = description;
    if (discount_type !== undefined) 
      updatePayload.discount_type = discount_type;
    if (discount_value !== undefined) 
      updatePayload.discount_value = discount_value;
    if (min_booking_amount !== undefined) 
      updatePayload.min_booking_amount = min_booking_amount;
    if (max_discount_amount !== undefined) 
      updatePayload.max_discount_amount = max_discount_amount;
    if (start_date !== undefined) updatePayload.start_date = start_date;
    if (end_date !== undefined) updatePayload.end_date = end_date;
    if (usage_limit !== undefined) updatePayload.usage_limit = usage_limit;
    if (status !== undefined) 
      updatePayload.is_active = status === 'active' ? true : false;

    const updatedPromotion = await promotionRepository.updatePromotion(
      promotion,
      updatePayload
    );

    return updatedPromotion;
  }

  /**
   * Delete promotion
   */
  async deletePromotion(id) {
    const promotion = await promotionRepository.findPromotionById(id);

    if (!promotion) {
      throw { statusCode: 404, message: 'Promotion not found' };
    }

    await promotionRepository.deletePromotion(promotion);
  }

  /**
   * Calculate discount amount
   */
  calculateDiscountAmount(promotion, bookingAmount) {
    let discountAmount = 0;

    if (promotion.discount_type === 'percentage') {
      discountAmount = (bookingAmount * promotion.discount_value) / 100;
    } else {
      discountAmount = promotion.discount_value;
    }

    // Apply max discount limit
    if (
      promotion.max_discount_amount && 
      discountAmount > promotion.max_discount_amount
    ) {
      discountAmount = promotion.max_discount_amount;
    }

    return discountAmount;
  }

  /**
   * Validate and apply promotion
   */
  async validatePromotion(validationData) {
    const { code, booking_amount } = validationData;

    const promotion = await promotionRepository.findPromotionByCode(code);

    if (!promotion) {
      throw {
        statusCode: 404,
        message: 'Promotion code not found',
      };
    }

    // Check if promotion is active
    if (promotion.status !== 'active') {
      throw {
        statusCode: 400,
        message: 'Promotion is not active',
      };
    }

    // Check date validity
    const now = new Date();
    if (
      now < new Date(promotion.start_date) || 
      now > new Date(promotion.end_date)
    ) {
      throw {
        statusCode: 400,
        message: 'Promotion is not valid at this time',
      };
    }

    // Check usage limit
    if (
      promotion.usage_limit && 
      promotion.used_count >= promotion.usage_limit
    ) {
      throw {
        statusCode: 400,
        message: 'Promotion usage limit reached',
      };
    }

    // Check minimum booking amount
    if (booking_amount < promotion.min_booking_amount) {
      throw {
        statusCode: 400,
        message: `Minimum booking amount is ${promotion.min_booking_amount}`,
      };
    }

    // Calculate discount
    const discountAmount = this.calculateDiscountAmount(
      promotion,
      booking_amount
    );
    const finalAmount = booking_amount - discountAmount;

    return {
      promotion: {
        id: promotion.id,
        code: promotion.code,
        name: promotion.name,
      },
      original_amount: booking_amount,
      discount_amount: discountAmount,
      final_amount: finalAmount,
    };
  }
}

// Export singleton instance
module.exports = new PromotionService();
