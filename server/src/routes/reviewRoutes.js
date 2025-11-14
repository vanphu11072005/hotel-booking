const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { 
  authenticateToken, 
  authorizeRoles 
} = require('../middlewares/auth');

/**
 * Review Routes
 * Base path: /api/reviews
 */

// Admin: Get all reviews
router.get('/', 
  authenticateToken, 
  authorizeRoles('admin', 'staff'), 
  reviewController.getAllReviews
);

// Protected: Create a new review (authenticated users)
router.post('/', 
  authenticateToken, 
  reviewController.createReview
);

// Public: Get reviews for a specific room
router.get('/room/:roomId', 
  reviewController.getRoomReviews
);

// Admin: Approve review
router.patch('/:id/approve', 
  authenticateToken, 
  authorizeRoles('admin', 'staff'), 
  reviewController.approveReview
);

// Admin: Reject review
router.patch('/:id/reject', 
  authenticateToken, 
  authorizeRoles('admin', 'staff'), 
  reviewController.rejectReview
);

module.exports = router;
