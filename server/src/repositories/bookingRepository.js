const { 
  Booking, 
  Room, 
  RoomType, 
  Payment, 
  User, 
  Service,
  ServiceUsage,
  sequelize 
} = require('../databases/models');
const { Op } = require('sequelize');

/**
 * Booking Repository - Data access layer
 * Xử lý tất cả các truy vấn database liên quan đến booking
 */
class BookingRepository {
  /**
   * Get safe RoomType attributes (exclude images)
   */
  getRoomTypeAttributes() {
    return [
      'id',
      'name',
      'description',
      'base_price',
      'capacity',
      'amenities',
      'created_at',
      'updated_at',
    ];
  }

  /**
   * Find all bookings with filters
   */
  async findAllBookings(whereClause, limit, offset, includeUser = true) {
    const include = [
      {
        model: Room,
        as: 'room',
        attributes: ['id', 'room_number', 'floor'],
      },
    ];

    if (includeUser) {
      include.push({
        model: User,
        as: 'user',
        attributes: ['id', 'full_name', 'email', 'phone'],
      });
    }

    const { count, rows } = await Booking.findAndCountAll({
      where: whereClause,
      include,
      limit,
      offset,
      order: [['created_at', 'DESC']],
    });

    return { count, bookings: rows };
  }

  /**
   * Find bookings by user ID
   */
  async findBookingsByUserId(userId) {
    return await Booking.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Room,
          as: 'room',
          include: [
            { 
              model: RoomType, 
              as: 'room_type', 
              attributes: this.getRoomTypeAttributes() 
            }
          ],
        },
      ],
      order: [['created_at', 'DESC']],
    });
  }

  /**
   * Find booking by ID with full details
   */
  async findBookingById(id) {
    return await Booking.findByPk(id, {
      include: [
        { 
          model: Room, 
          as: 'room', 
          include: [
            { 
              model: RoomType, 
              as: 'room_type', 
              attributes: this.getRoomTypeAttributes() 
            }
          ] 
        },
        { 
          model: User, 
          as: 'user',
          attributes: ['id', 'full_name', 'email', 'phone']
        },
        { model: Payment, as: 'payments' },
        { 
          model: ServiceUsage, 
          as: 'service_usages', 
          include: [{ model: Service, as: 'service' }] 
        },
      ],
    });
  }

  /**
   * Find booking by booking number
   */
  async findBookingByNumber(bookingNumber) {
    return await Booking.findOne({
      where: { booking_number: bookingNumber },
      include: [{ model: Room, as: 'room' }],
    });
  }

  /**
   * Find room by ID
   */
  async findRoomById(roomId) {
    return await Room.findByPk(roomId, {
      include: [
        { 
          model: RoomType, 
          as: 'room_type', 
          attributes: this.getRoomTypeAttributes() 
        }
      ],
    });
  }

  /**
   * Check for overlapping bookings
   */
  async findOverlappingBooking(roomId, checkInDate, checkOutDate) {
    return await Booking.findOne({
      where: {
        room_id: roomId,
        status: { [Op.ne]: 'cancelled' },
        [Op.and]: [
          { check_in_date: { [Op.lt]: new Date(checkOutDate) } },
          { check_out_date: { [Op.gt]: new Date(checkInDate) } },
        ],
      },
    });
  }

  /**
   * Create a new booking
   */
  async createBooking(bookingData, transaction) {
    return await Booking.create(bookingData, { transaction });
  }

  /**
   * Update a booking
   */
  async updateBooking(booking, updateData) {
    return await booking.update(updateData);
  }

  /**
   * Create a payment record
   */
  async createPayment(paymentData, transaction) {
    return await Payment.create(paymentData, { transaction });
  }

  /**
   * Find service by ID
   */
  async findServiceById(serviceId) {
    return await Service.findByPk(serviceId);
  }

  /**
   * Create service usage record
   */
  async createServiceUsage(serviceUsageData, transaction) {
    return await ServiceUsage.create(serviceUsageData, { transaction });
  }

  /**
   * Build where clause for booking filters
   */
  buildWhereClause(filters) {
    const { search, status, startDate, endDate } = filters;
    const whereClause = {};

    // Filter by search (booking_number)
    if (search) {
      whereClause[Op.or] = [
        { booking_number: { [Op.like]: `%${search}%` } },
      ];
    }

    // Filter by status
    if (status) {
      whereClause.status = status;
    }

    // Filter by date range
    if (startDate || endDate) {
      whereClause.check_in_date = {};
      if (startDate) {
        whereClause.check_in_date[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        whereClause.check_in_date[Op.lte] = new Date(endDate);
      }
    }

    return whereClause;
  }

  /**
   * Begin a transaction
   */
  async beginTransaction() {
    return await sequelize.transaction();
  }
}

// Export singleton instance
module.exports = new BookingRepository();
