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
  // Parse YYYY-MM-DD to local Date at 00:00
  parseLocalDate(dateStr) {
    if (!dateStr) return null;
    if (dateStr instanceof Date) return dateStr;
    const parts = String(dateStr).split('-');
    if (parts.length < 3) return new Date(dateStr);
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const d = parseInt(parts[2], 10);
    return new Date(y, m - 1, d);
  }
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
   * Only return parent bookings (not children)
   */
  async findAllBookings(whereClause, limit, offset, includeUser = true) {
    const { BookingRoom } = require('../databases/models');
    
    const include = [
      {
        model: Room,
        as: 'room',
        attributes: ['id', 'room_number', 'floor'],
      },
      {
        model: BookingRoom,
        as: 'booking_rooms',
        include: [{
          model: Room,
          as: 'room',
          include: [{
            model: RoomType,
            as: 'room_type',
            attributes: this.getRoomTypeAttributes()
          }]
        }]
      },
      {
        model: ServiceUsage,
        as: 'service_usages',
        include: [{
          model: Service,
          as: 'service',
          attributes: ['id', 'name', 'price', 'category']
        }]
      }
    ];

    if (includeUser) {
      include.push({
        model: User,
        as: 'user',
        attributes: ['id', 'full_name', 'email', 'phone'],
      });
    }

    // Add filter for parent bookings only
    const finalWhereClause = {
      ...whereClause,
      parent_booking_id: null
    };

    const { count, rows } = await Booking.findAndCountAll({
      where: finalWhereClause,
      include,
      limit,
      offset,
      order: [['created_at', 'DESC']],
    });

    return { count, bookings: rows };
  }

  /**
   * Find bookings by user ID
   * Only return parent bookings (not children from old multi-booking system)
   */
  async findBookingsByUserId(userId) {
    const { BookingRoom } = require('../databases/models');
    return await Booking.findAll({
      where: { 
        user_id: userId,
        parent_booking_id: null // Only get parent/standalone bookings
      },
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
        {
          model: BookingRoom,
          as: 'booking_rooms',
          include: [{
            model: Room,
            as: 'room',
            include: [{
              model: RoomType,
              as: 'room_type',
              attributes: this.getRoomTypeAttributes()
            }]
          }]
        }
      ],
      order: [['created_at', 'DESC']],
    });
  }

  /**
   * Find booking by ID with full details
   */
  async findBookingById(id) {
    const { BookingRoom } = require('../databases/models');
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
        {
          model: BookingRoom,
          as: 'booking_rooms',
          include: [{
            model: Room,
            as: 'room',
            include: [{
              model: RoomType,
              as: 'room_type',
              attributes: this.getRoomTypeAttributes()
            }]
          }]
        }
      ],
    });
  }

  /**
   * Find booking by booking number
   */
  async findBookingByNumber(bookingNumber) {
    const { BookingRoom } = require('../databases/models');
    
    return await Booking.findOne({
      where: { booking_number: bookingNumber },
      include: [
        {
          model: Room,
          as: 'room',
          include: [{
            model: RoomType,
            as: 'room_type',
            attributes: this.getRoomTypeAttributes()
          }]
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'full_name', 'email', 'phone'],
        },
        {
          model: BookingRoom,
          as: 'booking_rooms',
          include: [{
            model: Room,
            as: 'room',
            include: [{
              model: RoomType,
              as: 'room_type',
              attributes: this.getRoomTypeAttributes()
            }]
          }]
        },
        {
          model: ServiceUsage,
          as: 'service_usages',
          include: [{
            model: Service,
            as: 'service',
            attributes: ['id', 'name', 'price', 'category']
          }]
        }
      ],
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
  async findOverlappingBooking(roomId, checkInDate, checkOutDate, transaction = null) {
    const opts = {
      where: {
        room_id: roomId,
        status: { [Op.ne]: 'cancelled' },
        [Op.and]: [
          { check_in_date: { [Op.lt]: this.parseLocalDate(checkOutDate) } },
          { check_out_date: { [Op.gt]: this.parseLocalDate(checkInDate) } },
        ],
      },
    };
    if (transaction) opts.transaction = transaction;
    return await Booking.findOne(opts);
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
        whereClause.check_in_date[Op.gte] = this.parseLocalDate(startDate);
      }
      if (endDate) {
        whereClause.check_in_date[Op.lte] = this.parseLocalDate(endDate);
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
