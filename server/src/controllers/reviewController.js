const reviewService = require('../services/reviewService');

/**
 * Get reviews for a specific room
 */
const getRoomReviews = async (req, res, next) => {
  try {
    // Support both routes: /api/reviews/room/:roomId and /api/rooms/:id/reviews
    const roomId = req.params.roomId || req.params.id;
    const reviews = await reviewService.getRoomReviews(roomId);

    res.status(200).json({
      status: 'success',
      data: { reviews },
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
 * Create a new review (authenticated users only)
 */
const createReview = async (req, res, next) => {
  try {
    const review = await reviewService.createReview(
      req.user.id,
      req.body
    );

    res.status(201).json({
      status: 'success',
      message: 'Review submitted successfully and is pending approval',
      data: { review },
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
 * Update review (Owner only, within allowed time window)
 */
const updateReview = async (req, res, next) => {
  try {
    const reviewId = req.params.id;
    const userId = req.user.id;
    const updateData = req.body;

    const updated = await reviewService.updateReview(
      userId,
      reviewId,
      updateData
    );

    res.status(200).json({
      status: 'success',
      message: 'Review updated successfully and is pending approval',
      data: { review: updated },
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
 * Approve review (Admin only)
 */
const approveReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const review = await reviewService.approveReview(id);

    res.status(200).json({
      status: 'success',
      message: 'Review approved successfully',
      data: { review },
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
 * Reject review (Admin only)
 */
const rejectReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const review = await reviewService.rejectReview(id);

    res.status(200).json({
      status: 'success',
      message: 'Review rejected successfully',
      data: { review },
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
 * Get all reviews (Admin only)
 */
const getAllReviews = async (req, res, next) => {
  try {
    const result = await reviewService.getAllReviews(req.query);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    console.error('Error in getAllReviews:', error);
    next(error);
  }
};

module.exports = {
  getRoomReviews,
  createReview,
  approveReview,
  rejectReview,
  getAllReviews,
  updateReview,
};
