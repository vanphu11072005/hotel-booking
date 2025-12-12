const { Review, User, Room, Booking } = require('../databases/models');
const { Op } = require('sequelize');

/**
 * Review Repository - Data access layer
 * Xử lý tất cả các truy vấn database liên quan đến review
 */
class ReviewRepository {
  /**
   * Find reviews by room_type ID with approved status
   */
  async findApprovedReviewsByRoomTypeId(roomTypeId) {
    return await Review.findAll({
      where: {
        room_type_id: parseInt(roomTypeId, 10),
        status: 'approved',
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'full_name', 'email'],
        },
      ],
      order: [['created_at', 'DESC']],
    });
  }

  /**
   * Find existing review by booking id
   */
  async findReviewByBookingId(bookingId) {
    if (!bookingId) return null;
    return await Review.findOne({
      where: { booking_id: bookingId }
    });
  }

  /**
   * Create a new review
   */
  async createReview(reviewData) {
    return await Review.create(reviewData);
  }

  /**
   * Find review by ID
   */
  async findReviewById(id) {
    return await Review.findByPk(id);
  }

  /**
   * Update review
   */
  async updateReview(review, updateData) {
    return await review.update(updateData);
  }

  /**
   * Find all reviews with filters and pagination
   */
  async findAllReviews(whereClause, limit, offset) {
    const RoomType = require('../databases/models').RoomType;
    const { count, rows } = await Review.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'full_name', 'email', 'phone'],
        },
        {
          model: RoomType,
          as: 'room_type',
          attributes: ['id', 'name'],
        },
      ],
      limit,
      offset,
      order: [['created_at', 'DESC']],
    });

    return { reviews: rows, count };
  }

  /**
   * Build where clause for review filters
   */
  buildWhereClause(filters) {
    const { status } = filters;
    const whereClause = {};

    if (status) {
      whereClause.status = status;
    }

    return whereClause;
  }
}

// Export singleton instance
module.exports = new ReviewRepository();
