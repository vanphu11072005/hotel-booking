const { 
  Favorite, 
  Room, 
  RoomType, 
  Review,
  Sequelize 
} = require('../databases/models');
const { Op } = require('sequelize');

/**
 * Favorite Repository - Data access layer
 * Xử lý tất cả các truy vấn database liên quan đến favorite
 */
class FavoriteRepository {
  /**
   * Get safe RoomType attributes (exclude images)
   */
  getRoomTypeAttributes() {
    return [
      'id',
      'name',
      'description',
      'base_price',
      'capacity',
      'amenities',
      'created_at',
      'updated_at',
    ];
  }

  /**
   * Find room by ID
   */
  async findRoomById(roomId) {
    return await Room.findByPk(roomId);
  }

  /**
   * Find favorite by user and room
   */
  async findFavorite(userId, roomId) {
    return await Favorite.findOne({
      where: {
        user_id: userId,
        room_id: roomId,
      },
    });
  }

  /**
   * Create a new favorite
   */
  async createFavorite(userId, roomId) {
    return await Favorite.create({
      user_id: userId,
      room_id: roomId,
    });
  }

  /**
   * Delete a favorite
   */
  async deleteFavorite(favorite) {
    return await favorite.destroy();
  }

  /**
   * Find all favorites by user ID
   */
  async findAllFavoritesByUserId(userId) {
    return await Favorite.findAll({
      where: { user_id: userId },
      attributes: ['id', 'user_id', 'room_id', 'created_at'],
      order: [['created_at', 'DESC']],
    });
  }

  /**
   * Find rooms by IDs with room type
   */
  async findRoomsByIds(roomIds) {
    return await Room.findAll({
      where: roomIds.length ? { id: { [Op.in]: roomIds } } : { id: 0 },
      include: [
        {
          model: RoomType,
          as: 'room_type',
          attributes: this.getRoomTypeAttributes(),
        },
      ],
    });
  }

  /**
   * Get review stats for a room
   */
  async getReviewStats(roomId) {
    // Resolve room_type_id from the room, then aggregate reviews for that room type
    const room = await Room.findByPk(roomId, { attributes: ['room_type_id'] });
    if (!room) return null;

    return await Review.findOne({
      where: {
        room_type_id: room.room_type_id,
        status: 'approved',
      },
      attributes: [
        [Sequelize.fn('AVG', Sequelize.col('rating')), 'average_rating'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'total_reviews'],
      ],
      raw: true,
    });
  }
}

// Export singleton instance
module.exports = new FavoriteRepository();
