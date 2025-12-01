const { Room, RoomType, Review, sequelize, Sequelize } = require('../databases/models');
const { Op } = require('sequelize');

/**
 * Room Repository - Data access layer
 * Xử lý các thao tác database liên quan đến room
 */
class RoomRepository {
  /**
   * Safe RoomType attributes (không bao gồm images)
   */
  getRoomTypeAttributes() {
    return [
      'id',
      'name',
      'description',
      'base_price',
      'capacity',
      'amenities',
      'images',
      'featured',
      'created_at',
      'updated_at',
    ];
  }

  /**
   * Tìm tất cả rooms với filters và pagination
   */
  async findAllRooms(whereClause, roomTypeWhere, limit, offset, order) {
    const { Booking, User } = require('../databases/models');
    
    return await Room.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: RoomType,
          as: 'room_type',
          attributes: this.getRoomTypeAttributes(),
          where: Object.keys(roomTypeWhere).length > 0
            ? roomTypeWhere
            : undefined,
          required: true,
        },
        {
          model: Booking,
          as: 'bookings',
          where: {
            status: 'checked_in'
          },
          required: false,
          limit: 1,
          order: [['check_in_date', 'DESC']],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'full_name', 'email', 'phone']
            }
          ]
        }
      ],
      limit,
      offset,
      order,
      distinct: true,
    });
  }

  /**
   * Tìm room theo ID
   */
  async findRoomById(id) {
    return await Room.findByPk(id, {
      include: [
        {
          model: RoomType,
          as: 'room_type',
          attributes: this.getRoomTypeAttributes(),
        },
      ],
    });
  }

  /**
   * Tìm room theo room_number
   */
  async findRoomByNumber(roomNumber) {
    return await Room.findOne({
      where: { room_number: roomNumber },
    });
  }

  /**
   * Tạo room mới
   */
  async createRoom(roomData) {
    return await Room.create(roomData);
  }

  /**
   * Cập nhật room
   */
  async updateRoom(room, updateData) {
    return await room.update(updateData);
  }

  /**
   * Xóa room
   */
  async deleteRoom(room) {
    return await room.destroy();
  }

  /**
   * Lấy tất cả room types
   */
  async findAllRoomTypes() {
    return await RoomType.findAll({
      attributes: this.getRoomTypeAttributes(),
      order: [['id', 'ASC']],
    });
  }

  /**
   * Tìm room type theo ID
   */
  async findRoomTypeById(id) {
    return await RoomType.findByPk(id);
  }

  async updateRoomType(roomType, updateData) {
    return await roomType.update(updateData);
  }

  /**
   * Count available rooms by room_type_id
   */
  async countAvailableRoomsByType(roomTypeId, transaction) {
    const opts = {
      where: {
        room_type_id: roomTypeId,
        status: 'available',
      },
      transaction,
    };
    return await Room.count(opts);
  }

  /**
   * Count booked distinct rooms in a date range for a room type
   */
  async countBookedRoomsInRangeByType(roomTypeId, checkInDate, checkOutDate, transaction) {
    const { Booking, BookingRoom } = require('../databases/models');
    const { Op: OpLocal } = require('sequelize');

    // Get distinct room_ids from Booking.room_id for overlapping bookings
    const bookingRows = await Booking.findAll({
      attributes: ['room_id'],
      include: [
        {
          model: Room,
          as: 'room',
          where: { room_type_id: roomTypeId },
          attributes: [],
        },
      ],
      where: {
        status: { [OpLocal.notIn]: ['cancelled'] },
        [OpLocal.and]: [
          { check_in_date: { [OpLocal.lt]: checkOutDate } },
          { check_out_date: { [OpLocal.gt]: checkInDate } },
        ],
      },
      group: ['room_id'],
      raw: true,
      transaction,
    });

    const idsFromBookings = bookingRows.map((r) => r.room_id).filter(Boolean);

    // Get distinct room_ids from BookingRoom for overlapping bookings
    const bookingRoomRows = await BookingRoom.findAll({
      attributes: ['room_id'],
      include: [
        {
          model: Booking,
          as: 'booking',
          where: {
            status: { [OpLocal.notIn]: ['cancelled'] },
            [OpLocal.and]: [
              { check_in_date: { [OpLocal.lt]: checkOutDate } },
              { check_out_date: { [OpLocal.gt]: checkInDate } },
            ],
          },
          attributes: [],
        },
        {
          model: Room,
          as: 'room',
          where: { room_type_id: roomTypeId },
          attributes: [],
        },
      ],
      group: ['room_id'],
      raw: true,
      transaction,
    });

    const idsFromBookingRooms = bookingRoomRows.map((r) => r.room_id).filter(Boolean);

    const uniqueIds = Array.from(new Set([...idsFromBookings, ...idsFromBookingRooms]));
    return uniqueIds.length;
  }

  /**
   * Find available rooms for a room type (optionally with lock/transaction)
   */
  async findRoomsByTypeAvailable(roomTypeId, { limit = null, transaction, lock = false } = {}) {
    const opts = {
      where: {
        room_type_id: roomTypeId,
        status: 'available',
      },
      attributes: ['id', 'room_number'],
      raw: true,
    };
    if (limit) opts.limit = limit;
    if (transaction) {
      opts.transaction = transaction;
      if (lock) opts.lock = transaction.LOCK.UPDATE;
    }
    return await Room.findAll(opts);
  }

  /**
   * Find booked room ids (distinct) in a date range for a room type
   */
  async findBookedRoomIdsByTypeInRange(roomTypeId, checkInDate, checkOutDate, transaction) {
    const { Booking, BookingRoom } = require('../databases/models');
    const { Op: OpLocal } = require('sequelize');

    const bookingRows = await Booking.findAll({
      attributes: ['room_id'],
      include: [
        {
          model: Room,
          as: 'room',
          where: { room_type_id: roomTypeId },
          attributes: [],
        },
      ],
      where: {
        status: { [OpLocal.notIn]: ['cancelled'] },
        [OpLocal.and]: [
          { check_in_date: { [OpLocal.lt]: checkOutDate } },
          { check_out_date: { [OpLocal.gt]: checkInDate } },
        ],
      },
      group: ['room_id'],
      raw: true,
      transaction,
    });

    const idsFromBookings = bookingRows.map((r) => r.room_id).filter(Boolean);

    const bookingRoomRows = await BookingRoom.findAll({
      attributes: ['room_id'],
      include: [
        {
          model: Booking,
          as: 'booking',
          where: {
            status: { [OpLocal.notIn]: ['cancelled'] },
            [OpLocal.and]: [
              { check_in_date: { [OpLocal.lt]: checkOutDate } },
              { check_out_date: { [OpLocal.gt]: checkInDate } },
            ],
          },
          attributes: [],
        },
        {
          model: Room,
          as: 'room',
          where: { room_type_id: roomTypeId },
          attributes: [],
        },
      ],
      group: ['room_id'],
      raw: true,
      transaction,
    });

    const idsFromBookingRooms = bookingRoomRows.map((r) => r.room_id).filter(Boolean);

    const uniqueIds = Array.from(new Set([...idsFromBookings, ...idsFromBookingRooms]));
    return uniqueIds;
  }

  /**
   * Update room status and return updated room with room_type
   */
  async updateRoomStatus(roomId, status) {
    const room = await Room.findByPk(roomId);
    if (!room) return null;
    room.status = status;
    await room.save();
    return await Room.findByPk(roomId, {
      include: [
        {
          model: RoomType,
          as: 'room_type',
          attributes: this.getRoomTypeAttributes(),
        },
      ],
    });
  }

  /**
   * Lấy review stats cho room
   */
  async getReviewStats(roomId) {
    // Resolve room_type_id from the given roomId, then compute
    // aggregate stats across reviews attached to that room type.
    const room = await Room.findByPk(roomId, { attributes: ['room_type_id'] });
    if (!room) return null;

    return await Review.findOne({
      where: {
        room_type_id: room.room_type_id,
        status: 'approved',
      },
      attributes: [
        [
          Sequelize.fn('AVG', Sequelize.col('rating')),
          'average_rating',
        ],
        [
          Sequelize.fn('COUNT', Sequelize.col('id')),
          'total_reviews',
        ],
      ],
      raw: true,
    });
  }

  /**
   * Get review stats directly for a room type id
   */
  async getReviewStatsByRoomType(roomTypeId) {
    return await Review.findOne({
      where: {
        room_type_id: roomTypeId,
        status: 'approved',
      },
      attributes: [
        [Sequelize.fn('AVG', Sequelize.col('rating')), 'average_rating'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'total_reviews'],
      ],
      raw: true,
    });
  }

  /**
   * Lấy tất cả amenities từ RoomType và Room
   */
  async findAllAmenities() {
    const roomTypes = await RoomType.findAll({
      attributes: ['amenities'],
      raw: true,
    });

    // `amenities` removed from `rooms`; only room types are authoritative now
    return { roomTypes };
  }

  /**
   * Build where clause cho room search
   */
  buildRoomWhereClause(filters) {
    const { search, status, featured, amenities } = filters;
    const whereClause = {};

    // Filter by search (room number)
    if (search) {
      whereClause.room_number = { [Op.like]: `%${search}%` };
    }

    // Filter by status
    if (status) {
      whereClause.status = status;
    }

    // Note: `featured` is a room_type attribute now. It will be
    // applied to roomTypeWhere in buildRoomTypeWhereClause.

    // Filter by amenities (AND logic)
    if (amenities) {
      const amenitiesArr = String(amenities)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      
      if (amenitiesArr.length > 0) {
        // Match against room_type.amenities only (rooms no longer store amenities)
        whereClause[Op.and] = amenitiesArr.map((a) => ({
          [Op.or]: [
            sequelize.where(sequelize.col('room_type.amenities'), {
              [Op.like]: `%${a}%`,
            }),
          ],
        }));
      }
    }

    return whereClause;
  }

  /**
   * Build where clause cho room type
   */
  buildRoomTypeWhereClause(filters) {
    const { type, minPrice, maxPrice, capacity, featured } = filters;
    const roomTypeWhere = {};

    // Filter by room type (ID or name)
    if (type) {
      if (!isNaN(type)) {
        // Return empty object if type is ID (will be used in room where)
        return { useRoomTypeId: true, roomTypeId: parseInt(type) };
      } else {
        roomTypeWhere.name = { [Op.like]: `%${type}%` };
      }
    }

    // Filter by capacity (rooms that can hold at least `capacity` people)
    if (capacity) {
      roomTypeWhere.capacity = { [Op.gte]: parseInt(capacity) };
    }

    // Filter by price
    if (minPrice || maxPrice) {
      roomTypeWhere.base_price = {};
      if (minPrice) {
        roomTypeWhere.base_price[Op.gte] = parseFloat(minPrice);
      }
      if (maxPrice) {
        roomTypeWhere.base_price[Op.lte] = parseFloat(maxPrice);
      }
    }

    // Filter by featured (now stored on room_types)
    if (featured !== undefined) {
      roomTypeWhere.featured = featured === 'true' || featured === true;
    }

    return roomTypeWhere;
  }

  /**
   * Build order clause
   */
  buildOrderClause(sort) {
    if (sort === 'newest' || sort === 'created_at') {
      return [['created_at', 'DESC']];
    }
    // Default: order by room_type.featured first then created_at desc
    return [
      [{ model: RoomType, as: 'room_type' }, 'featured', 'DESC'],
      ['created_at', 'DESC'],
    ];
  }
}

module.exports = new RoomRepository();
