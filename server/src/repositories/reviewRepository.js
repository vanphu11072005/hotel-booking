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
    // Look up the room to obtain its room_type_id, then return
    // approved reviews attached to that room type.
    const room = await Room.findByPk(roomId, { attributes: ['room_type_id'] });
    if (!room) return [];

    return await Review.findAll({
      where: {
        room_type_id: parseInt(room.room_type_id, 10),
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
    // Find by user and the room's room_type
    const room = await Room.findByPk(roomId, { attributes: ['room_type_id'] });
    if (!room) return null;
    return await Review.findOne({
      where: {
        user_id: userId,
        room_type_id: room.room_type_id,
      },
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
