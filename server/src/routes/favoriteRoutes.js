const express = require('express');
const router = express.Router();
const favoriteController = require(
  '../controllers/favoriteController'
);
const { authenticateToken } = require('../middlewares/auth');

/**
 * Favorite Routes
 * All routes require authentication
 */

// Get user's favorites
router.get(
  '/',
  authenticateToken,
  favoriteController.getFavorites
);

// Check if room is favorited
router.get(
  '/check/:roomId',
  authenticateToken,
  favoriteController.checkFavorite
);

// Add room to favorites
router.post(
  '/:roomId',
  authenticateToken,
  favoriteController.addFavorite
);

// Remove room from favorites
router.delete(
  '/:roomId',
  authenticateToken,
  favoriteController.removeFavorite
);

module.exports = router;
