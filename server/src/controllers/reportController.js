const {
  Booking,
  Payment,
  Room,
  User,
  Service,
  BookingService,
  sequelize,
  Sequelize,
} = require('../databases/models');
const { Op } = require('sequelize');

/**
 * Get dashboard statistics
 * GET /api/reports/dashboard
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.created_at = {};
      if (startDate) {
        dateFilter.created_at[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        dateFilter.created_at[Op.lte] = new Date(endDate);
      }
    }

    // Total revenue
    const totalRevenue = await Payment.sum('amount', {
      where: {
        payment_status: 'completed',
        ...dateFilter,
      },
    });

    // Total bookings
    const totalBookings = await Booking.count({
      where: dateFilter,
    });

    // Available rooms
    const availableRooms = await Room.count({
      where: { status: 'available' },
    });

    // Total customers
    const totalCustomers = await User.count({
      where: { role_id: 3 }, // 3 = customer
    });

    // Revenue by date (last 7 days or date range)
    const revenueByDate = await Payment.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('payment_date')), 'date'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'revenue'],
      ],
      where: {
        payment_status: 'completed',
        ...dateFilter,
      },
      group: [sequelize.fn('DATE', sequelize.col('payment_date'))],
      order: [[sequelize.fn('DATE', sequelize.col('payment_date')), 'ASC']],
      raw: true,
    });

    // Bookings by status
    const bookingsByStatus = await Booking.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      where: dateFilter,
      group: ['status'],
      raw: true,
    });

    // Top rooms (by booking count)
    const topRooms = await Booking.findAll({
      attributes: [
        'room_id',
        [sequelize.fn('COUNT', sequelize.col('Booking.id')), 'booking_count'],
        [sequelize.fn('SUM', sequelize.col('total_price')), 'total_revenue'],
      ],
      include: [
        {
          model: Room,
          as: 'room',
          attributes: ['id', 'room_number', 'floor'],
        },
      ],
      where: dateFilter,
      group: ['room_id', 'room.id'],
      order: [[sequelize.fn('COUNT', sequelize.col('Booking.id')), 'DESC']],
      limit: 5,
      raw: true,
      nest: true,
    });

    // Service usage statistics
    const serviceUsage = await BookingService.findAll({
      attributes: [
        'service_id',
        [sequelize.fn('SUM', sequelize.col('quantity')), 'total_quantity'],
        [sequelize.fn('SUM', sequelize.col('total_price')), 'total_revenue'],
      ],
      include: [
        {
          model: Service,
          as: 'service',
          attributes: ['id', 'name', 'price', 'unit'],
        },
      ],
      group: ['service_id', 'service.id'],
      order: [[sequelize.fn('SUM', sequelize.col('quantity')), 'DESC']],
      limit: 5,
      raw: true,
      nest: true,
    });

    res.status(200).json({
      status: 'success',
      data: {
        summary: {
          total_revenue: totalRevenue || 0,
          total_bookings: totalBookings,
          available_rooms: availableRooms,
          total_customers: totalCustomers,
        },
        revenue_by_date: revenueByDate,
        bookings_by_status: bookingsByStatus,
        top_rooms: topRooms,
        service_usage: serviceUsage,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get detailed reports
 * GET /api/reports
 */
const getReports = async (req, res, next) => {
  try {
    const {
      type = 'revenue',
      startDate,
      endDate,
      from, // Accept 'from' param
      to,   // Accept 'to' param
      groupBy = 'day',
    } = req.query;

    const dateFilter = {};
    const start = startDate || from;
    const end = endDate || to;
    
    if (start || end) {
      dateFilter.created_at = {};
      if (start) {
        dateFilter.created_at[Op.gte] = new Date(start);
      }
      if (end) {
        dateFilter.created_at[Op.lte] = new Date(end);
      }
    }

    let reportData;

    switch (type) {
      case 'revenue':
        reportData = await generateRevenueReport(dateFilter, groupBy);
        break;
      case 'bookings':
        reportData = await generateBookingsReport(dateFilter, groupBy);
        break;
      case 'rooms':
        reportData = await generateRoomsReport(dateFilter);
        break;
      case 'customers':
        reportData = await generateCustomersReport(dateFilter);
        break;
      default:
        return res.status(400).json({
          status: 'error',
          message: 'Invalid report type',
        });
    }

    res.status(200).json({
      status: 'success',
      data: reportData,
    });
  } catch (error) {
    console.error('Error in getReports:', error);
    next(error);
  }
};

/**
 * Export report to CSV
 * GET /api/reports/export
 */
const exportReport = async (req, res, next) => {
  try {
    const { type = 'revenue', startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.payment_date = {};
      if (startDate) {
        dateFilter.payment_date[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        dateFilter.payment_date[Op.lte] = new Date(endDate);
      }
    }

    let csvContent = '';
    let filename = '';

    switch (type) {
      case 'revenue':
        const payments = await Payment.findAll({
          where: {
            payment_status: 'completed',
            ...dateFilter,
          },
          include: [
            {
              model: Booking,
              as: 'booking',
              attributes: ['booking_number'],
              include: [
                {
                  model: User,
                  as: 'user',
                  attributes: ['full_name', 'email'],
                },
              ],
            },
          ],
          order: [['payment_date', 'DESC']],
        });

        csvContent = 'Date,Booking Number,Customer,Payment Method,Amount\n';
        payments.forEach((payment) => {
          csvContent += `${payment.payment_date},${payment.booking.booking_number},${payment.booking.user.full_name},${payment.payment_method},${payment.amount}\n`;
        });
        filename = `revenue_report_${Date.now()}.csv`;
        break;

      case 'bookings':
        const bookings = await Booking.findAll({
          where: dateFilter,
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['full_name', 'email'],
            },
            {
              model: Room,
              as: 'room',
              attributes: ['room_number'],
            },
          ],
          order: [['created_at', 'DESC']],
        });

        csvContent = 'Booking Number,Customer,Room,Check In,Check Out,Status,Total Price\n';
        bookings.forEach((booking) => {
          csvContent += `${booking.booking_number},${booking.user.full_name},${booking.room.room_number},${booking.check_in_date},${booking.check_out_date},${booking.status},${booking.total_price}\n`;
        });
        filename = `bookings_report_${Date.now()}.csv`;
        break;

      default:
        return res.status(400).json({
          status: 'error',
          message: 'Invalid export type',
        });
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

// Helper functions
const generateRevenueReport = async (dateFilter, groupBy) => {
  let dateFormat;
  switch (groupBy) {
    case 'month':
      dateFormat = '%Y-%m';
      break;
    case 'week':
      dateFormat = '%Y-%u';
      break;
    default:
      dateFormat = '%Y-%m-%d';
  }

  const revenue = await Payment.findAll({
    attributes: [
      [sequelize.fn('DATE_FORMAT', sequelize.col('payment_date'), dateFormat), 'period'],
      [sequelize.fn('SUM', sequelize.col('amount')), 'total_revenue'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'payment_count'],
    ],
    where: {
      payment_status: 'completed',
      ...dateFilter,
    },
    group: [sequelize.fn('DATE_FORMAT', sequelize.col('payment_date'), dateFormat)],
    order: [[sequelize.fn('DATE_FORMAT', sequelize.col('payment_date'), dateFormat), 'ASC']],
    raw: true,
  });

  return { revenue };
};

const generateBookingsReport = async (dateFilter, groupBy) => {
  let dateFormat;
  switch (groupBy) {
    case 'month':
      dateFormat = '%Y-%m';
      break;
    case 'week':
      dateFormat = '%Y-%u';
      break;
    default:
      dateFormat = '%Y-%m-%d';
  }

  const bookings = await Booking.findAll({
    attributes: [
      [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), dateFormat), 'period'],
      'status',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
    ],
    where: dateFilter,
    group: [
      sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), dateFormat),
      'status',
    ],
    order: [[sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), dateFormat), 'ASC']],
    raw: true,
  });

  return { bookings };
};

const generateRoomsReport = async (dateFilter) => {
  const roomStats = await Room.findAll({
    attributes: [
      'id',
      'room_number',
      'status',
      [
        sequelize.literal(`(
          SELECT COUNT(*)
          FROM bookings
          WHERE bookings.room_id = Room.id
        )`),
        'total_bookings',
      ],
      [
        sequelize.literal(`(
          SELECT SUM(total_price)
          FROM bookings
          WHERE bookings.room_id = Room.id
        )`),
        'total_revenue',
      ],
    ],
    order: [['room_number', 'ASC']],
  });

  return { rooms: roomStats };
};

const generateCustomersReport = async (dateFilter) => {
  const customerStats = await User.findAll({
    attributes: [
      'id',
      'full_name',
      'email',
      [
        sequelize.literal(`(
          SELECT COUNT(*)
          FROM bookings
          WHERE bookings.user_id = User.id
        )`),
        'total_bookings',
      ],
      [
        sequelize.literal(`(
          SELECT SUM(total_price)
          FROM bookings
          WHERE bookings.user_id = User.id
        )`),
        'total_spent',
      ],
    ],
    where: { role: 'customer' },
    order: [[sequelize.literal('total_bookings'), 'DESC']],
    limit: 50,
  });

  return { customers: customerStats };
};

module.exports = {
  getDashboardStats,
  getReports,
  exportReport,
};
