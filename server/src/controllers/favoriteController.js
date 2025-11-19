const favoriteService = require('../services/favoriteService');

/**
 * Add room to favorites
 */
const addFavorite = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const favorite = await favoriteService.addFavorite(
      req.user.id,
      roomId
    );

    res.status(201).json({
      status: 'success',
      message: 'Đã thêm vào danh sách yêu thích',
      data: { favorite },
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
 * Remove room from favorites
 */
const removeFavorite = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    await favoriteService.removeFavorite(req.user.id, roomId);

    res.status(200).json({
      status: 'success',
      message: 'Đã xóa khỏi danh sách yêu thích',
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
 * Get user's favorite rooms
 */
const getFavorites = async (req, res, next) => {
  try {
    const result = await favoriteService.getFavorites(req.user.id);

    res.status(200).json({
      status: 'success',
      data: result,
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
    const { roomId } = req.params;
    const isFavorited = await favoriteService.checkFavorite(
      req.user.id,
      roomId
    );

    res.status(200).json({
      status: 'success',
      data: { isFavorited },
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
