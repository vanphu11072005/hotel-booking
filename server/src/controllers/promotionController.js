const promotionService = require('../services/promotionService');

/**
 * Get all promotions with filters and pagination
 * GET /api/promotions
 */
const getPromotions = async (req, res, next) => {
  try {
    const result = await promotionService.getPromotions(req.query);

    res.status(200).json({
      status: 'success',
      data: result,
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
    const promotion = await promotionService.getPromotionById(id);

    res.status(200).json({
      status: 'success',
      data: { promotion },
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        status: 'error',
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * Create new promotion
 * POST /api/promotions
 */
const createPromotion = async (req, res, next) => {
  try {
    const promotion = await promotionService.createPromotion(req.body);

    res.status(201).json({
      status: 'success',
      message: 'Promotion created successfully',
      data: { promotion },
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        status: 'error',
        message: error.message,
      });
    }
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
    const promotion = await promotionService.updatePromotion(
      id,
      req.body
    );

    res.status(200).json({
      status: 'success',
      message: 'Promotion updated successfully',
      data: { promotion },
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        status: 'error',
        message: error.message,
      });
    }
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
    await promotionService.deletePromotion(id);

    res.status(200).json({
      status: 'success',
      message: 'Promotion deleted successfully',
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        status: 'error',
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * Validate and apply promotion
 * POST /api/promotions/validate
 */
const validatePromotion = async (req, res, next) => {
  try {
    const result = await promotionService.validatePromotion(req.body);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        status: 'error',
        message: error.message,
      });
    }
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
