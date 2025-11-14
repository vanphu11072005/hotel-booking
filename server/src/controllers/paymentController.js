const { Payment, Booking, User, Room } = require('../databases/models');
const { Op } = require('sequelize');

/**
 * Get all payments with filters and pagination
 * GET /api/payments
 */
const getPayments = async (req, res, next) => {
  try {
    const {
      search,
      method,
      status,
      from, // Changed from startDate
      to,   // Changed from endDate
      page = 1,
      limit = 10,
    } = req.query;

    const whereClause = {};
    const bookingWhere = {};

    // Filter by search (booking number)
    if (search) {
      bookingWhere.booking_number = { [Op.like]: `%${search}%` };
    }

    // Filter by payment method
    if (method) {
      whereClause.payment_method = method;
    }

    // Filter by status
    if (status) {
      whereClause.payment_status = status; // Changed from 'status' to 'payment_status'
    }

    // Filter by date range
    if (from || to) {
      whereClause.payment_date = {};
      if (from) {
        whereClause.payment_date[Op.gte] = new Date(from);
      }
      if (to) {
        whereClause.payment_date[Op.lte] = new Date(to);
      }
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: payments } = await Payment.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Booking,
          as: 'booking',
          where: Object.keys(bookingWhere).length > 0 ? bookingWhere : undefined,
          required: false,
          attributes: ['id', 'booking_number', 'check_in_date', 'check_out_date'],
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
        },
      ],
      limit: parseInt(limit),
      offset: offset,
      order: [['payment_date', 'DESC']],
    });

    // Calculate total revenue - use simpler where clause
    const revenueWhere = { payment_status: 'completed' }; // Changed from 'status'
    if (method) revenueWhere.payment_method = method;
    
    const totalRevenue = await Payment.sum('amount', {
      where: revenueWhere,
    });

    res.status(200).json({
      status: 'success',
      data: {
        payments,
        summary: {
          totalRevenue: totalRevenue || 0,
        },
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Error in getPayments:', error);
    next(error);
  }
};

/**
 * Get payment by ID
 * GET /api/payments/:id
 */
const getPaymentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findByPk(id, {
      include: [
        {
          model: Booking,
          as: 'booking',
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
        },
      ],
    });

    if (!payment) {
      return res.status(404).json({
        status: 'error',
        message: 'Payment not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        payment,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPayments,
  getPaymentById,
};
