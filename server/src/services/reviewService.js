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
    const { rating, comment, booking_id } = reviewData;

    // Validate review data
    this.validateReviewData(rating, comment);

    if (!booking_id) {
      throw { statusCode: 400, message: 'booking_id is required' };
    }

    // Check booking exists and belongs to user
    const bookingRepo = require('../repositories/bookingRepository');
    const booking = await bookingRepo.findBookingById(booking_id);
    if (!booking) {
      throw { statusCode: 404, message: 'Booking not found' };
    }

    if (booking.user_id !== userId) {
      throw { statusCode: 403, message: 'You can only review your own bookings' };
    }

    // Booking must be completed. Some codepaths use 'checked_out'
    // as the completed state — accept either to remain compatible.
    const completedStatuses = ['completed', 'checked_out'];
    if (!completedStatuses.includes(booking.status)) {
      throw {
        statusCode: 400,
        message: 'Only completed bookings can be reviewed',
      };
    }

    // Ensure one review per booking
    const existingByBooking = await reviewRepository.findReviewByBookingId(booking_id);
    if (existingByBooking) {
      throw { statusCode: 400, message: 'This booking already has a review' };
    }

    // Derive room_type_id from the booked room
    const roomRepo = require('../repositories/roomRepository');
    const room = await roomRepo.findRoomById(booking.room_id);
    if (!room) {
      throw { statusCode: 404, message: 'Booked room not found' };
    }

    const review = await reviewRepository.createReview({
      user_id: userId,
      room_type_id: room.room_type_id,
      booking_id,
      rating,
      comment,
      status: 'pending',
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
   * Update review by owner within time window
   */
  async updateReview(userId, reviewId, updateData) {
    const review = await reviewRepository.findReviewById(reviewId);

    if (!review) {
      throw { statusCode: 404, message: 'Review not found' };
    }

    // Only owner can update
    if (review.user_id !== userId) {
      throw { statusCode: 403, message: 'You can only edit your own review' };
    }

    // Time window check (in hours)
    const windowHours = parseInt(process.env.REVIEW_EDIT_WINDOW_HOURS || '48', 10);
    const createdAt = new Date(review.created_at || review.createdAt);
    const now = new Date();
    const hoursDiff = Math.abs(now - createdAt) / (1000 * 60 * 60);

    if (hoursDiff > windowHours) {
      throw { statusCode: 403, message: `Editing period expired (allowed ${windowHours} hours)` };
    }

    // Apply changes and set status back to pending for re-approval
    const allowed = {};
    if (updateData.rating !== undefined) allowed.rating = updateData.rating;
    if (updateData.comment !== undefined) allowed.comment = updateData.comment;

    // Force status to pending so admin can re-approve
    allowed.status = 'pending';

    const updated = await reviewRepository.updateReview(review, allowed);

    return updated;
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
