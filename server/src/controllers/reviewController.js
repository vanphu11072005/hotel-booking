const { Review, User, Room, Booking } = 
  require('../databases/models');

/**
 * Get reviews for a specific room
 */
const getRoomReviews = async (req, res, next) => {
  try {
    const { roomId } = req.params;

    const reviews = await Review.findAll({
      where: {
        room_id: roomId,
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

    res.status(200).json({
      status: 'success',
      data: {
        reviews,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new review (authenticated users only)
 */
const createReview = async (req, res, next) => {
  try {
    const { room_id, rating, comment } = req.body;
    const userId = req.user.id;

    // Check if room exists
    const room = await Room.findByPk(room_id);
    if (!room) {
      return res.status(404).json({
        status: 'error',
        message: 'Room not found',
      });
    }

    // Optional: Check if user has booked this room
    // const hasBooked = await Booking.findOne({
    //   where: {
    //     user_id: userId,
    //     room_id: room_id,
    //     status: 'completed',
    //   },
    // });
    // if (!hasBooked) {
    //   return res.status(403).json({
    //     status: 'error',
    //     message: 'You can only review rooms you have booked',
    //   });
    // }

    // Check if user already reviewed this room
    const existingReview = await Review.findOne({
      where: {
        user_id: userId,
        room_id: room_id,
      },
    });

    if (existingReview) {
      return res.status(400).json({
        status: 'error',
        message: 'You have already reviewed this room',
      });
    }

    // Create review
    const review = await Review.create({
      user_id: userId,
      room_id,
      rating,
      comment,
      status: 'pending', // Admin will approve
    });

    res.status(201).json({
      status: 'success',
      message: 'Review submitted successfully and is pending approval',
      data: {
        review,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve review (Admin only)
 */
const approveReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    const review = await Review.findByPk(id);
    if (!review) {
      return res.status(404).json({
        status: 'error',
        message: 'Review not found',
      });
    }

    await review.update({ status: 'approved' });

    res.status(200).json({
      status: 'success',
      message: 'Review approved successfully',
      data: {
        review,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reject review (Admin only)
 */
const rejectReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    const review = await Review.findByPk(id);
    if (!review) {
      return res.status(404).json({
        status: 'error',
        message: 'Review not found',
      });
    }

    await review.update({ status: 'rejected' });

    res.status(200).json({
      status: 'success',
      message: 'Review rejected successfully',
      data: {
        review,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all reviews (Admin only)
 */
const getAllReviews = async (req, res, next) => {
  try {
    const { status } = req.query;

    const whereClause = {};
    if (status) {
      whereClause.status = status;
    }

    const reviews = await Review.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'full_name', 'email'],
        },
        {
          model: Room,
          as: 'room',
          attributes: ['id', 'room_number'],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    res.status(200).json({
      status: 'success',
      data: {
        reviews,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRoomReviews,
  createReview,
  approveReview,
  rejectReview,
  getAllReviews,
};
