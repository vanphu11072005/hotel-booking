const {
  Booking,
  Payment,
  Room,
  User,
  Service,
  ServiceUsage,
  sequelize,
} = require('../databases/models');
const { Op } = require('sequelize');

/**
 * Report Repository - Data access layer
 * Xử lý tất cả các truy vấn database liên quan đến reports
 */
class ReportRepository {
  /**
   * Get total revenue
   */
  async getTotalRevenue(dateFilter) {
    return await Payment.sum('amount', {
      where: {
        payment_status: 'completed',
        ...dateFilter,
      },
    });
  }

  /**
   * Get total bookings count
   */
  async getTotalBookings(dateFilter) {
    return await Booking.count({
      where: dateFilter,
    });
  }

  /**
   * Get total rooms count
   */
  async getTotalRoomsCount() {
    return await Room.count();
  }

  /**
   * Get occupied rooms count (rooms with checked_in bookings)
   */
  async getOccupiedRoomsCount() {
    const { BookingRoom } = require('../databases/models');
    
    // Get all checked_in bookings with their rooms
    const checkedInBookings = await Booking.findAll({
      where: { status: 'checked_in' },
      include: [{
        model: BookingRoom,
        as: 'booking_rooms',
        attributes: ['room_id'],
        required: true,
      }],
      raw: false,
    });

    // Get unique room IDs
    const roomIds = new Set();
    checkedInBookings.forEach(booking => {
      if (booking.booking_rooms) {
        booking.booking_rooms.forEach(br => {
          if (br.room_id) roomIds.add(br.room_id);
        });
      }
    });

    return roomIds.size;
  }

  /**
   * Get available rooms count
   */
  async getAvailableRoomsCount() {
    return await Room.count({
      where: { status: 'available' },
    });
  }

  /**
   * Get total customers count
   */
  async getTotalCustomersCount() {
    return await User.count({
      where: { role_id: 3 }, // 3 = customer
    });
  }

  /**
   * Get revenue by date
   */
  async getRevenueByDate(dateFilter) {
    return await Payment.findAll({
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
  }

  /**
   * Get bookings by status
   */
  async getBookingsByStatus(dateFilter) {
    return await Booking.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      where: dateFilter,
      group: ['status'],
      raw: true,
    });
  }

  /**
   * Get top rooms by booking count
   */
  async getTopRooms(dateFilter, limit = 5) {
    return await Booking.findAll({
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
      limit,
      raw: true,
      nest: true,
    });
  }

  /**
   * Get service usage statistics
   */
  async getServiceUsage(limit = 5) {
    return await ServiceUsage.findAll({
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
      limit,
      raw: true,
      nest: true,
    });
  }

  /**
   * Get revenue report grouped by period
   */
  async getRevenueReport(dateFilter, dateFormat) {
    return await Payment.findAll({
      attributes: [
        [
          sequelize.fn('DATE_FORMAT', sequelize.col('payment_date'), dateFormat),
          'period',
        ],
        [sequelize.fn('SUM', sequelize.col('amount')), 'total_revenue'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'payment_count'],
      ],
      where: {
        payment_status: 'completed',
        ...dateFilter,
      },
      group: [
        sequelize.fn('DATE_FORMAT', sequelize.col('payment_date'), dateFormat),
      ],
      order: [
        [
          sequelize.fn('DATE_FORMAT', sequelize.col('payment_date'), dateFormat),
          'ASC',
        ],
      ],
      raw: true,
    });
  }

  /**
   * Get bookings report grouped by period
   */
  async getBookingsReport(dateFilter, dateFormat) {
    return await Booking.findAll({
      attributes: [
        [
          sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), dateFormat),
          'period',
        ],
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      where: dateFilter,
      group: [
        sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), dateFormat),
        'status',
      ],
      order: [
        [
          sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), dateFormat),
          'ASC',
        ],
      ],
      raw: true,
    });
  }

  /**
   * Get rooms statistics
   */
  async getRoomsStats() {
    return await Room.findAll({
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
  }

  /**
   * Get customers statistics
   */
  async getCustomersStats(limit = 50) {
    return await User.findAll({
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
      limit,
    });
  }

  /**
   * Get payments for export
   */
  async getPaymentsForExport(dateFilter) {
    return await Payment.findAll({
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
  }

  /**
   * Get bookings for export
   */
  async getBookingsForExport(dateFilter) {
    return await Booking.findAll({
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
  }
}

// Export singleton instance
module.exports = new ReportRepository();
