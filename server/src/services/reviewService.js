const reviewRepository = require('../repositories/reviewRepository');

/**
 * Review Service - Business logic layer
 * Xử lý logic nghiệp vụ liên quan đến review
 */
class ReviewService {
  /**
   * Get reviews for a specific room
   */
  async getRoomReviews(roomId) {
    if (!roomId) {
      throw {
        statusCode: 400,
        message: 'roomId is required',
      };
    }

    const reviews = await reviewRepository.findApprovedReviewsByRoomId(
      roomId
    );

    return reviews;
  }

  /**
   * Validate review data
   */
  validateReviewData(rating, comment) {
    if (!rating || rating < 1 || rating > 5) {
      throw {
        statusCode: 400,
        message: 'Rating must be between 1 and 5',
      };
    }

    if (comment && comment.length > 1000) {
      throw {
        statusCode: 400,
        message: 'Comment must not exceed 1000 characters',
      };
    }
  }

  /**
   * Create a new review
   */
  async createReview(userId, reviewData) {
    const { room_id, rating, comment } = reviewData;

    // Validate review data
    this.validateReviewData(rating, comment);

    // Check if room exists
    const room = await reviewRepository.findRoomById(room_id);
    if (!room) {
      throw {
        statusCode: 404,
        message: 'Room not found',
      };
    }

    // Optional: Check if user has booked this room
    // Uncomment if you want to enforce this rule
    // const hasBooked = await reviewRepository.hasCompletedBooking(
    //   userId,
    //   room_id
    // );
    // if (!hasBooked) {
    //   throw {
    //     statusCode: 403,
    //     message: 'You can only review rooms you have booked',
    //   };
    // }

    // Check if user already reviewed this room
    const existingReview = await reviewRepository.findReviewByUserAndRoom(
      userId,
      room_id
    );

    if (existingReview) {
      throw {
        statusCode: 400,
        message: 'You have already reviewed this room',
      };
    }

    // Create review
    const review = await reviewRepository.createReview({
      user_id: userId,
      room_id,
      rating,
      comment,
      status: 'pending', // Admin will approve
    });

    return review;
  }

  /**
   * Approve review (Admin only)
   */
  async approveReview(id) {
    const review = await reviewRepository.findReviewById(id);

    if (!review) {
      throw {
        statusCode: 404,
        message: 'Review not found',
      };
    }

    const updatedReview = await reviewRepository.updateReview(review, {
      status: 'approved',
    });

    return updatedReview;
  }

  /**
   * Reject review (Admin only)
   */
  async rejectReview(id) {
    const review = await reviewRepository.findReviewById(id);

    if (!review) {
      throw {
        statusCode: 404,
        message: 'Review not found',
      };
    }

    const updatedReview = await reviewRepository.updateReview(review, {
      status: 'rejected',
    });

    return updatedReview;
  }

  /**
   * Get all reviews with filters and pagination (Admin only)
   */
  async getAllReviews(filters) {
    const { page = 1, limit = 10 } = filters;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const whereClause = reviewRepository.buildWhereClause(filters);

    const { reviews, count } = await reviewRepository.findAllReviews(
      whereClause,
      parseInt(limit),
      offset
    );

    return {
      reviews,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit)),
      },
    };
  }
}

// Export singleton instance
module.exports = new ReviewService();
