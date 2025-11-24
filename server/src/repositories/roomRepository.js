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

  /**
   * Lấy review stats cho room
   */
  async getReviewStats(roomId) {
    return await Review.findOne({
      where: {
        room_id: roomId,
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
   * Lấy tất cả amenities từ RoomType và Room
   */
  async findAllAmenities() {
    const roomTypes = await RoomType.findAll({
      attributes: ['amenities'],
      raw: true,
    });

    const rooms = await Room.findAll({
      attributes: ['amenities'],
      raw: true,
    });

    return { roomTypes, rooms };
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

    // Filter by featured
    if (featured !== undefined) {
      whereClause.featured = featured === 'true' || featured === true;
    }

    // Filter by amenities (AND logic)
    if (amenities) {
      const amenitiesArr = String(amenities)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      
      if (amenitiesArr.length > 0) {
        whereClause[Op.and] = amenitiesArr.map((a) => ({
          [Op.or]: [
            sequelize.where(sequelize.col('room_type.amenities'), {
              [Op.like]: `%${a}%`,
            }),
            { amenities: { [Op.like]: `%${a}%` } },
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
    const { type, minPrice, maxPrice, capacity } = filters;
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

    // Filter by capacity
    if (capacity) {
      roomTypeWhere.capacity = { [Op.eq]: parseInt(capacity) };
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

    return roomTypeWhere;
  }

  /**
   * Build order clause
   */
  buildOrderClause(sort) {
    if (sort === 'newest' || sort === 'created_at') {
      return [['created_at', 'DESC']];
    }
    // Default: featured first then created_at desc
    return [
      ['featured', 'DESC'],
      ['created_at', 'DESC'],
    ];
  }
}

module.exports = new RoomRepository();
