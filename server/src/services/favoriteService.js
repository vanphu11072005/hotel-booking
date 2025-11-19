const favoriteRepository = require('../repositories/favoriteRepository');

/**
 * Favorite Service - Business logic layer
 * Xử lý logic nghiệp vụ liên quan đến favorite
 */
class FavoriteService {
  /**
   * Add room to favorites
   */
  async addFavorite(userId, roomId) {
    // Check if room exists
    const room = await favoriteRepository.findRoomById(roomId);
    if (!room) {
      throw {
        statusCode: 404,
        message: 'Không tìm thấy phòng',
      };
    }

    // Check if already favorited
    const existingFavorite = await favoriteRepository.findFavorite(
      userId,
      roomId
    );

    if (existingFavorite) {
      throw {
        statusCode: 400,
        message: 'Phòng đã có trong danh sách yêu thích',
      };
    }

    // Create favorite
    const favorite = await favoriteRepository.createFavorite(userId, roomId);

    return favorite;
  }

  /**
   * Remove room from favorites
   */
  async removeFavorite(userId, roomId) {
    // Find favorite
    const favorite = await favoriteRepository.findFavorite(userId, roomId);

    if (!favorite) {
      throw {
        statusCode: 404,
        message: 'Không tìm thấy phòng trong danh sách yêu thích',
      };
    }

    // Delete favorite
    await favoriteRepository.deleteFavorite(favorite);
  }

  /**
   * Get user's favorite rooms with ratings
   */
  async getFavorites(userId) {
    // Get all favorites
    const favorites = await favoriteRepository.findAllFavoritesByUserId(
      userId
    );

    // Get room IDs
    const roomIds = favorites.map((f) => f.room_id).filter(Boolean);

    // Load rooms with room types
    const rooms = await favoriteRepository.findRoomsByIds(roomIds);

    // Create rooms map by ID
    const roomsById = {};
    rooms.forEach((r) => {
      roomsById[r.id] = r;
    });

    // Add ratings to each room
    const favoritesWithRatings = await Promise.all(
      favorites.map(async (favorite) => {
        const room = roomsById[favorite.room_id];

        if (!room) {
          return favorite.toJSON();
        }

        // Get review stats
        const reviewStats = await favoriteRepository.getReviewStats(room.id);

        return {
          ...favorite.toJSON(),
          room: {
            ...room.toJSON(),
            average_rating: reviewStats?.average_rating
              ? Math.round(parseFloat(reviewStats.average_rating) * 10) / 10
              : null,
            total_reviews: reviewStats?.total_reviews
              ? parseInt(reviewStats.total_reviews, 10)
              : 0,
          },
        };
      })
    );

    return {
      favorites: favoritesWithRatings,
      total: favoritesWithRatings.length,
    };
  }

  /**
   * Check if room is favorited by user
   */
  async checkFavorite(userId, roomId) {
    const favorite = await favoriteRepository.findFavorite(userId, roomId);
    return !!favorite;
  }
}

// Export singleton instance
module.exports = new FavoriteService();
