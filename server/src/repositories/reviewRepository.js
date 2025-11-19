const { Review, User, Room, Booking } = require('../databases/models');
const { Op } = require('sequelize');

/**
 * Review Repository - Data access layer
 * Xử lý tất cả các truy vấn database liên quan đến review
 */
class ReviewRepository {
  /**
   * Find reviews by room ID with approved status
   */
  async findApprovedReviewsByRoomId(roomId) {
    return await Review.findAll({
      where: {
        room_id: parseInt(roomId, 10),
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
   * Find room by ID
   */
  async findRoomById(roomId) {
    return await Room.findByPk(roomId);
  }

  /**
   * Find existing review by user and room
   */
  async findReviewByUserAndRoom(userId, roomId) {
    return await Review.findOne({
      where: {
        user_id: userId,
        room_id: roomId,
      },
    });
  }

  /**
   * Check if user has completed booking for room
   */
  async hasCompletedBooking(userId, roomId) {
    return await Booking.findOne({
      where: {
        user_id: userId,
        room_id: roomId,
        status: 'completed',
      },
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
    const { count, rows } = await Review.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'full_name', 'email', 'phone'],
        },
        {
          model: Room,
          as: 'room',
          attributes: ['id', 'room_number'],
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
