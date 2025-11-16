const { 
  Favorite, 
  Room, 
  RoomType, 
  Review,
  Sequelize 
} = require('../databases/models');
const { Op } = require('sequelize');

/**
 * Add room to favorites
 */
const addFavorite = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { roomId } = req.params;

    // Check if room exists
    const room = await Room.findByPk(roomId);
    if (!room) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy phòng',
      });
    }

    // Check if already favorited
    const existingFavorite = await Favorite.findOne({
      where: {
        user_id: userId,
        room_id: roomId,
      },
    });

    if (existingFavorite) {
      return res.status(400).json({
        status: 'error',
        message: 'Phòng đã có trong danh sách yêu thích',
      });
    }

    // Create favorite
    const favorite = await Favorite.create({
      user_id: userId,
      room_id: roomId,
    });

    res.status(201).json({
      status: 'success',
      message: 'Đã thêm vào danh sách yêu thích',
      data: {
        favorite,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove room from favorites
 */
const removeFavorite = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { roomId } = req.params;

    // Find and delete favorite
    const favorite = await Favorite.findOne({
      where: {
        user_id: userId,
        room_id: roomId,
      },
    });

    if (!favorite) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy phòng trong danh sách yêu thích',
      });
    }

    await favorite.destroy();

    res.status(200).json({
      status: 'success',
      message: 'Đã xóa khỏi danh sách yêu thích',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's favorite rooms
 */
const getFavorites = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get all favorites (minimal fields) to avoid complex nested
    // JSON selection issues on some MySQL setups. We'll load rooms
    // (with room_type) separately and merge results.
    const favorites = await Favorite.findAll({
      where: { user_id: userId },
      attributes: ['id', 'user_id', 'room_id', 'created_at'],
      order: [['created_at', 'DESC']],
    });

    // Load rooms for these favorites
    const roomIds = favorites.map((f) => f.room_id).filter(Boolean);
    const rooms = await Room.findAll({
      where: roomIds.length ? { id: { [Op.in]: roomIds } } : { id: 0 },
      include: [
        {
          model: RoomType,
          as: 'room_type',
          // Explicit attributes avoid selecting a possibly-missing
          // `images` column on older DB schemas; migrations should
          // add that column, but defend here to prevent 500s.
          attributes: [
            'id',
            'name',
            'description',
            'base_price',
            'capacity',
            'amenities',
            'created_at',
            'updated_at',
          ],
        },
      ],
    });

    const roomsById = {};
    rooms.forEach((r) => {
      roomsById[r.id] = r;
    });

    // Get ratings for each room and merge with favorite entries
    const roomsWithRatings = await Promise.all(
      favorites.map(async (favorite) => {
        const room = roomsById[favorite.room_id];

        if (!room) {
          return favorite.toJSON();
        }

        const reviewStats = await Review.findOne({
          where: {
            room_id: room.id,
            status: 'approved',
          },
          attributes: [
            [Sequelize.fn('AVG', Sequelize.col('rating')), 'average_rating'],
            [Sequelize.fn('COUNT', Sequelize.col('id')), 'total_reviews'],
          ],
          raw: true,
        });

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

    res.status(200).json({
      status: 'success',
      data: {
        favorites: roomsWithRatings,
        total: roomsWithRatings.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Check if room is favorited by user
 */
const checkFavorite = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { roomId } = req.params;

    const favorite = await Favorite.findOne({
      where: {
        user_id: userId,
        room_id: roomId,
      },
    });

    res.status(200).json({
      status: 'success',
      data: {
        isFavorited: !!favorite,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addFavorite,
  removeFavorite,
  getFavorites,
  checkFavorite,
};
