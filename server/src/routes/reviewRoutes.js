const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { 
  authenticateToken, 
  authorizeRoles 
} = require('../middlewares/auth');

/**
 * Review Routes
 */

// Public: Get reviews for a specific room
router.get('/rooms/:roomId/reviews', 
  reviewController.getRoomReviews
);

// Protected: Create a new review (authenticated users)
router.post('/', 
  authenticateToken, 
  reviewController.createReview
);

// Admin: Approve review
router.patch('/:id/approve', 
  authenticateToken, 
  authorizeRoles('admin'), 
  reviewController.approveReview
);

// Admin: Reject review
router.patch('/:id/reject', 
  authenticateToken, 
  authorizeRoles('admin'), 
  reviewController.rejectReview
);

// Admin: Get all reviews
router.get('/', 
  authenticateToken, 
  authorizeRoles('admin'), 
  reviewController.getAllReviews
);

module.exports = router;
