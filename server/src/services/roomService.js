const roomRepository = require('../repositories/roomRepository');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

/**
 * Room Service - Business logic layer
 * Xử lý logic nghiệp vụ liên quan đến room
 */
class RoomService {
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
   * Lấy danh sách rooms với filters và pagination
   */
  async getRooms(filters) {
    const {
      type,
      page = 1,
      limit = 10,
      sort,
    } = filters;

    // Build where clauses
    const whereClause = roomRepository.buildRoomWhereClause(filters);
    const roomTypeWhere = roomRepository.buildRoomTypeWhereClause(filters);

    // Handle room_type_id filter
    if (roomTypeWhere.useRoomTypeId) {
      whereClause.room_type_id = roomTypeWhere.roomTypeId;
      delete roomTypeWhere.useRoomTypeId;
      delete roomTypeWhere.roomTypeId;
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Build order
    const order = roomRepository.buildOrderClause(sort);

    // Get rooms from repository
    const { count, rows: rooms } = await roomRepository.findAllRooms(
      whereClause,
      roomTypeWhere,
      limitNum,
      offset,
      order
    );

    // Get ratings for each room
    const roomsWithRatings = await this.addRatingsToRooms(rooms);

    return {
      rooms: roomsWithRatings,
      pagination: {
        total: count,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(count / limitNum),
      },
    };
  }

  /**
   * Lấy room theo ID
   */
  async getRoomById(id) {
    const room = await roomRepository.findRoomById(id);

    if (!room) {
      const error = new Error('Room not found');
      error.statusCode = 404;
      throw error;
    }

    // Get review stats
    const reviewStats = await roomRepository.getReviewStats(room.id);

    const roomData = {
      ...room.toJSON(),
      average_rating: reviewStats?.average_rating
        ? Math.round(parseFloat(reviewStats.average_rating) * 10) / 10
        : null,
      total_reviews: reviewStats?.total_reviews
        ? parseInt(reviewStats.total_reviews, 10)
        : 0,
    };

    return roomData;
  }

  /**
   * Lấy tất cả room types
   */
  async getRoomTypes() {
    return await roomRepository.findAllRoomTypes();
  }

  /**
   * Lấy danh sách amenities
   */
  async getAmenities() {
    const { roomTypes, rooms } = await roomRepository.findAllAmenities();

    const all = [];

    const pushFromValue = (val) => {
      if (!val) return;
      if (Array.isArray(val)) {
        val.forEach((v) => all.push(String(v).trim()));
      } else if (typeof val === 'string') {
        try {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed)) {
            parsed.forEach((v) => all.push(String(v).trim()));
            return;
          }
        } catch (e) {
          // not JSON
        }
        // comma separated
        val.split(',').forEach((v) => all.push(String(v).trim()));
      } else if (typeof val === 'object') {
        Object.values(val).forEach((v) => {
          if (Array.isArray(v)) v.forEach((x) => all.push(String(x).trim()));
          else all.push(String(v).trim());
        });
      }
    };

    roomTypes.forEach((rt) => pushFromValue(rt.amenities));
    rooms.forEach((r) => pushFromValue(r.amenities));

    // unique, filter empty
    const unique = Array.from(new Set(all.map((s) => s))).filter(Boolean);

    return unique;
  }

  /**
   * Tìm phòng có sẵn
   */
  async searchAvailableRooms(filters) {
    const { from, to, type, capacity, amenities, page = 1, limit = 12 } = filters;

    if (!from || !to) {
      const error = new Error('From and to dates are required');
      error.statusCode = 400;
      throw error;
    }

    const checkInDate = this.parseLocalDate(from);
    const checkOutDate = this.parseLocalDate(to);

    if (checkInDate >= checkOutDate) {
      const error = new Error('Check-out date must be after check-in date');
      error.statusCode = 400;
      throw error;
    }

    // Build room type filter
    const roomTypeWhere = {};
    if (type) {
      roomTypeWhere.name = { [Op.like]: `%${type}%` };
    }
    if (capacity) {
      // Match room types with capacity greater than or equal to requested
      roomTypeWhere.capacity = { [Op.gte]: parseInt(capacity) };
    }

    // Pagination
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const offset = (pageNum - 1) * limitNum;

    // Build where clause for available rooms
    const whereClause = { status: 'available' };
    
    // Add amenities filter
    if (amenities) {
      const roomWhereWithAmenities = roomRepository.buildRoomWhereClause({ amenities });
      if (roomWhereWithAmenities[Op.and]) {
        whereClause[Op.and] = roomWhereWithAmenities[Op.and];
      }
    }

    // Get available rooms
    const order = [['featured', 'DESC'], ['created_at', 'DESC']];
    const { count, rows: availableRooms } = await roomRepository.findAllRooms(
      whereClause,
      roomTypeWhere,
      limitNum,
      offset,
      order
    );

    // Get ratings for available rooms
    const roomsWithRatings = await this.addRatingsToRooms(availableRooms);

    return {
      rooms: roomsWithRatings,
      search: { from, to, type, capacity },
      pagination: {
        total: count,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(count / limitNum),
      },
    };
  }

  /**
   * Tạo room mới
   */
  async createRoom(roomData) {
    const {
      room_type_id,
      room_number,
      floor,
      status,
      featured,
      price,
    } = roomData;

    // Check if room type exists
    const roomType = await roomRepository.findRoomTypeById(room_type_id);
    if (!roomType) {
      const error = new Error('Room type not found');
      error.statusCode = 404;
      throw error;
    }

    // Check if room number already exists
    const existingRoom = await roomRepository.findRoomByNumber(room_number);
    if (existingRoom) {
      const error = new Error('Room number already exists');
      error.statusCode = 400;
      throw error;
    }

    const room = await roomRepository.createRoom({
      room_type_id,
      room_number,
      floor,
      status: status || 'available',
      featured: featured || false,
      price,
    });

    return room;
  }

  /**
   * Cập nhật room
   */
  async updateRoom(id, updateData) {
    const room = await roomRepository.findRoomById(id);

    if (!room) {
      const error = new Error('Room not found');
      error.statusCode = 404;
      throw error;
    }

    // Check if room type exists if updating
    if (updateData.room_type_id) {
      const roomType = await roomRepository.findRoomTypeById(updateData.room_type_id);
      if (!roomType) {
        const error = new Error('Room type not found');
        error.statusCode = 404;
        throw error;
      }
    }

    await roomRepository.updateRoom(room, updateData);

    return room;
  }

  /**
   * Xóa room
   */
  async deleteRoom(id) {
    const room = await roomRepository.findRoomById(id);

    if (!room) {
      const error = new Error('Room not found');
      error.statusCode = 404;
      throw error;
    }

    await roomRepository.deleteRoom(room);

    return true;
  }

  /**
   * Upload room images
   */
  async uploadRoomImages(id, files) {
    const room = await roomRepository.findRoomById(id);

    if (!room) {
      const error = new Error('Room not found');
      error.statusCode = 404;
      throw error;
    }

    // Get uploaded file URLs
    const imageUrls = files.map(file => `/uploads/rooms/${file.filename}`);
    
    // Get existing images and parse them
    const existingImages = this.parseImages(room.images);
    
    // Append new images
    const updatedImages = [...existingImages, ...imageUrls];

    // Update room images
    await roomRepository.updateRoom(room, { images: updatedImages });

    return updatedImages;
  }

  /**
   * Xóa room image
   */
  async deleteRoomImage(id, imageUrl) {
    const room = await roomRepository.findRoomById(id);

    if (!room) {
      const error = new Error('Room not found');
      error.statusCode = 404;
      throw error;
    }

    // Get existing images and parse them
    const existingImages = this.parseImages(room.images);
    
    // Remove the specified image
    const updatedImages = existingImages.filter(img => img !== imageUrl);

    // Delete file from disk
    this.deleteImageFile(imageUrl);

    // Update room images
    await roomRepository.updateRoom(room, { images: updatedImages });

    return updatedImages;
  }

  /**
   * Thêm ratings vào danh sách rooms
   */
  async addRatingsToRooms(rooms) {
    return await Promise.all(
      rooms.map(async (room) => {
        const reviewStats = await roomRepository.getReviewStats(room.id);

        const item = {
          ...room.toJSON(),
          average_rating: reviewStats?.average_rating
            ? Math.round(parseFloat(reviewStats.average_rating) * 10) / 10
            : null,
          total_reviews: reviewStats?.total_reviews
            ? parseInt(reviewStats.total_reviews, 10)
            : 0,
        };

        // Clean up room_type images
        if (item.room_type) {
          delete item.room_type.images;
        }

        return item;
      })
    );
  }

  /**
   * Normalize images thành absolute URLs
   */
  normalizeImages(images, baseUrl) {
    if (!images) return [];
    let imgs = images;
    if (typeof images === 'string') {
      try {
        imgs = JSON.parse(images);
      } catch (e) {
        // comma separated?
        imgs = images.split(',').map((s) => s.trim()).filter(Boolean);
      }
    }
    if (!Array.isArray(imgs)) return [];
    return imgs.map((img) => {
      if (!img) return img;
      if (/^https?:\/\//i.test(img)) return img;
      // ensure leading slash
      const pathPart = img.startsWith('/') ? img : `/${img}`;
      return `${baseUrl}${pathPart}`;
    });
  }

  /**
   * Format room với normalized images
   */
  formatRoomImages(room, baseUrl) {
    const formatted = { ...room };
    try {
      formatted.images = this.normalizeImages(formatted.images, baseUrl);
    } catch (e) {
      formatted.images = [];
    }
    return formatted;
  }

  /**
   * Format nhiều rooms với normalized images
   */
  formatRoomsImages(rooms, baseUrl) {
    return rooms.map((room) => this.formatRoomImages(room, baseUrl));
  }

  /**
   * Parse images từ database
   */
  parseImages(images) {
    if (!images) return [];
    if (Array.isArray(images)) return images;
    if (typeof images === 'string') {
      try {
        const parsed = JSON.parse(images);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  }

  /**
   * Xóa file ảnh
   */
  deleteImageFile(imageUrl) {
    try {
      const filename = path.basename(imageUrl);
      const filePath = path.join(__dirname, '../../uploads/rooms', filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.warn('Không thể xóa ảnh:', imageUrl, error);
    }
  }

  /**
   * Xóa nhiều files upload khi có lỗi
   */
  cleanupUploadedFiles(files) {
    files.forEach(file => {
      try {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      } catch (err) {
        console.error('Error deleting file:', err);
      }
    });
  }

  /**
   * Đếm số phòng trống của cùng loại trong khoảng thời gian
   */
  async getAvailableRoomCount(roomId, checkInDate, checkOutDate, options = {}) {
    const { Room, Booking } = require('../databases/models');
    const transaction = options.transaction;
    
    // Get room to find room_type_id
    const room = await Room.findByPk(roomId);
    if (!room) {
      return 0;
    }

    // Count total rooms of this type with status 'available'
    const totalRooms = await Room.count({
      where: {
        room_type_id: room.room_type_id,
        status: 'available'
      },
      transaction,
    });

    if (!checkInDate || !checkOutDate) {
      return totalRooms;
    }

    // Count booked rooms in date range using overlap formula
    // overlap when booking.check_in_date < checkOutDate
    // and booking.check_out_date > checkInDate
    const bookedCount = await Booking.count({
      distinct: true,
      col: 'room_id',
      include: [{
        model: Room,
        as: 'room',
        where: {
          room_type_id: room.room_type_id
        },
        attributes: []
      }],
      where: {
        status: {
          [Op.notIn]: ['cancelled']
        },
        [Op.and]: [
          { check_in_date: { [Op.lt]: this.parseLocalDate(checkOutDate) } },
          { check_out_date: { [Op.gt]: this.parseLocalDate(checkInDate) } },
        ],
      },
      transaction,
    });

    const availableCount = Math.max(0, totalRooms - bookedCount);
    return availableCount;
  }

  /**
   * Get list of available room IDs of same type for date range
   */
  async getAvailableRoomsForType(roomId, checkInDate, checkOutDate, quantity, options = {}) {
    const { Room, Booking } = require('../databases/models');
    const transaction = options.transaction;
    
    // Get room to find room_type_id
    const room = await Room.findByPk(roomId);
    if (!room) {
      return [];
    }

    // Get all rooms of this type
    const findAllOpts = {
      where: {
        room_type_id: room.room_type_id,
        status: 'available'
      },
      attributes: ['id', 'room_number'],
      raw: true
    };
    if (transaction) {
      findAllOpts.transaction = transaction;
      // Lock room rows to prevent concurrent allocation races
      findAllOpts.lock = transaction.LOCK.UPDATE;
    }

    const allRooms = await Room.findAll(findAllOpts);

    if (!checkInDate || !checkOutDate) {
      return allRooms.slice(0, quantity);
    }

    // Get booked room IDs in date range using overlap formula
    const bookedRoomIds = await Booking.findAll({
      attributes: ['room_id'],
      include: [{
        model: Room,
        as: 'room',
        where: {
          room_type_id: room.room_type_id
        },
        attributes: []
      }],
      where: {
        status: {
          [Op.notIn]: ['cancelled']
        },
        [Op.and]: [
          { check_in_date: { [Op.lt]: this.parseLocalDate(checkOutDate) } },
          { check_out_date: { [Op.gt]: this.parseLocalDate(checkInDate) } },
        ],
      },
      group: ['room_id'],
      raw: true,
      transaction,
    });

    const bookedIds = bookedRoomIds.map(b => b.room_id);
    const availableRooms = allRooms.filter(r => !bookedIds.includes(r.id));
    return availableRooms.slice(0, quantity);
  }

  /**
   * Update room status (for staff)
   */
  async updateRoomStatus(roomId, status) {
    const { Room, RoomType } = require('../databases/models');
    
    const room = await Room.findByPk(roomId);

    if (!room) {
      throw { statusCode: 404, message: 'Room not found' };
    }

    console.log(`[updateRoomStatus] Room ${room.room_number} (ID: ${roomId}) - Old status: ${room.status}, New status: ${status}`);

    // Update status using direct update to avoid any potential issues
    const [updateCount] = await Room.update(
      { status: status },
      { 
        where: { id: roomId },
        validate: true
      }
    );

    console.log(`[updateRoomStatus] Updated ${updateCount} room(s) with status: ${status}`);

    // Verify update with raw query
    const verifyRoom = await Room.findByPk(roomId, { raw: true });
    console.log(`[updateRoomStatus] Verify from DB - Room ${verifyRoom.room_number} status in DB: "${verifyRoom.status}"`);

    // Return room with room_type info (force reload from DB)
    const updatedRoom = await Room.findByPk(roomId, {
      include: [
        {
          model: RoomType,
          as: 'room_type',
          attributes: ['id', 'name', 'base_price', 'capacity', 'description'],
        },
      ],
      raw: false
    });

    console.log(`[updateRoomStatus] Final response - Room ${updatedRoom.room_number} status: "${updatedRoom.status}"`);
    console.log(`[updateRoomStatus] Room object:`, JSON.stringify(updatedRoom.toJSON()));

    return updatedRoom;
  }
}

module.exports = new RoomService();
