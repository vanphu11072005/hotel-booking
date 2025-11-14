const { Promotion } = require('../databases/models');
const { Op } = require('sequelize');

/**
 * Get all promotions with filters and pagination
 * GET /api/promotions
 */
const getPromotions = async (req, res, next) => {
  try {
    const {
      search,
      status,
      type,
      page = 1,
      limit = 10,
    } = req.query;

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
      whereClause.status = status;
    }

    // Filter by type
    if (type) {
      whereClause.discount_type = type;
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: promotions } = await Promotion.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: offset,
      order: [['created_at', 'DESC']],
    });

    res.status(200).json({
      status: 'success',
      data: {
        promotions,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get promotion by ID
 * GET /api/promotions/:id
 */
const getPromotionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const promotion = await Promotion.findByPk(id);

    if (!promotion) {
      return res.status(404).json({
        status: 'error',
        message: 'Promotion not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        promotion,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new promotion
 * POST /api/promotions
 */
const createPromotion = async (req, res, next) => {
  try {
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
    } = req.body;

    // Check if promotion code already exists
    const existingPromotion = await Promotion.findOne({ where: { code } });
    if (existingPromotion) {
      return res.status(400).json({
        status: 'error',
        message: 'Promotion code already exists',
      });
    }

    // Validate discount value
    if (discount_type === 'percentage' && discount_value > 100) {
      return res.status(400).json({
        status: 'error',
        message: 'Percentage discount cannot exceed 100%',
      });
    }

    const promotion = await Promotion.create({
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
      status,
    });

    res.status(201).json({
      status: 'success',
      message: 'Promotion created successfully',
      data: {
        promotion,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update promotion
 * PUT /api/promotions/:id
 */
const updatePromotion = async (req, res, next) => {
  try {
    const { id } = req.params;
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
    } = req.body;

    const promotion = await Promotion.findByPk(id);
    if (!promotion) {
      return res.status(404).json({
        status: 'error',
        message: 'Promotion not found',
      });
    }

    // Check if new code already exists (excluding current promotion)
    if (code && code !== promotion.code) {
      const existingPromotion = await Promotion.findOne({
        where: {
          code,
          id: { [Op.ne]: id },
        },
      });
      if (existingPromotion) {
        return res.status(400).json({
          status: 'error',
          message: 'Promotion code already exists',
        });
      }
    }

    // Validate discount value
    if (discount_type === 'percentage' && discount_value > 100) {
      return res.status(400).json({
        status: 'error',
        message: 'Percentage discount cannot exceed 100%',
      });
    }

    const updateData = {};
    if (code !== undefined) updateData.code = code;
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (discount_type !== undefined) updateData.discount_type = discount_type;
    if (discount_value !== undefined) updateData.discount_value = discount_value;
    if (min_booking_amount !== undefined) updateData.min_booking_amount = min_booking_amount;
    if (max_discount_amount !== undefined) updateData.max_discount_amount = max_discount_amount;
    if (start_date !== undefined) updateData.start_date = start_date;
    if (end_date !== undefined) updateData.end_date = end_date;
    if (usage_limit !== undefined) updateData.usage_limit = usage_limit;
    if (status !== undefined) updateData.status = status;

    await promotion.update(updateData);

    res.status(200).json({
      status: 'success',
      message: 'Promotion updated successfully',
      data: {
        promotion,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete promotion
 * DELETE /api/promotions/:id
 */
const deletePromotion = async (req, res, next) => {
  try {
    const { id } = req.params;

    const promotion = await Promotion.findByPk(id);
    if (!promotion) {
      return res.status(404).json({
        status: 'error',
        message: 'Promotion not found',
      });
    }

    await promotion.destroy();

    res.status(200).json({
      status: 'success',
      message: 'Promotion deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Validate and apply promotion
 * POST /api/promotions/validate
 */
const validatePromotion = async (req, res, next) => {
  try {
    const { code, booking_amount } = req.body;

    const promotion = await Promotion.findOne({ where: { code } });

    if (!promotion) {
      return res.status(404).json({
        status: 'error',
        message: 'Promotion code not found',
      });
    }

    // Check if promotion is active
    if (promotion.status !== 'active') {
      return res.status(400).json({
        status: 'error',
        message: 'Promotion is not active',
      });
    }

    // Check date validity
    const now = new Date();
    if (now < new Date(promotion.start_date) || now > new Date(promotion.end_date)) {
      return res.status(400).json({
        status: 'error',
        message: 'Promotion is not valid at this time',
      });
    }

    // Check usage limit
    if (promotion.usage_limit && promotion.used_count >= promotion.usage_limit) {
      return res.status(400).json({
        status: 'error',
        message: 'Promotion usage limit reached',
      });
    }

    // Check minimum booking amount
    if (booking_amount < promotion.min_booking_amount) {
      return res.status(400).json({
        status: 'error',
        message: `Minimum booking amount is ${promotion.min_booking_amount}`,
      });
    }

    // Calculate discount
    let discount_amount = 0;
    if (promotion.discount_type === 'percentage') {
      discount_amount = (booking_amount * promotion.discount_value) / 100;
    } else {
      discount_amount = promotion.discount_value;
    }

    // Apply max discount limit
    if (promotion.max_discount_amount && discount_amount > promotion.max_discount_amount) {
      discount_amount = promotion.max_discount_amount;
    }

    const final_amount = booking_amount - discount_amount;

    res.status(200).json({
      status: 'success',
      data: {
        promotion: {
          id: promotion.id,
          code: promotion.code,
          name: promotion.name,
        },
        original_amount: booking_amount,
        discount_amount,
        final_amount,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPromotions,
  getPromotionById,
  createPromotion,
  updatePromotion,
  deletePromotion,
  validatePromotion,
};
