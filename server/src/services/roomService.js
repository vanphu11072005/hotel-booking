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
    const roomTypes = await roomRepository.findAllRoomTypes();

    // Attach review stats (average_rating, total_reviews) per room type
    const enhanced = await Promise.all(
      roomTypes.map(async (rt) => {
        const stats = await roomRepository.getReviewStatsByRoomType(rt.id);
        const obj = rt.toJSON ? rt.toJSON() : { ...rt };
        obj.average_rating = stats?.average_rating
          ? Math.round(parseFloat(stats.average_rating) * 10) / 10
          : null;
        obj.total_reviews = stats?.total_reviews
          ? parseInt(stats.total_reviews, 10)
          : 0;
        return obj;
      })
    );

    return enhanced;
  }

  /**
   * Lấy danh sách amenities
   */
  async getAmenities() {
    const { roomTypes } = await roomRepository.findAllAmenities();

    // roomTypes.amenities may be stored as JSON strings in DB; normalize
    const all = [];
    roomTypes.forEach((rt) => {
      const val = rt.amenities;
      if (!val) return;
      if (Array.isArray(val)) {
        val.forEach((v) => all.push(String(v).trim()));
        return;
      }
      if (typeof val === 'string') {
        try {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed)) {
            parsed.forEach((v) => all.push(String(v).trim()));
            return;
          }
        } catch (e) {
          // not JSON
        }
        val.split(',').forEach((v) => all.push(String(v).trim()));
        return;
      }
      if (typeof val === 'object') {
        Object.values(val).forEach((v) => {
          if (Array.isArray(v)) v.forEach((x) => all.push(String(x).trim()));
          else all.push(String(v).trim());
        });
      }
    });

    // unique, filter empty
    const unique = Array.from(new Set(all.map((s) => s))).filter(Boolean);

    return unique;
  }

  /**
   * Tìm phòng có sẵn (trả về Room Types)
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
      const error = new Error('Ngày trả phòng phải sau ngày nhận phòng');
      error.statusCode = 400;
      throw error;
    }

    // Build room type filter
    const roomTypeWhere = {};
    if (type) {
      roomTypeWhere.name = { [Op.like]: `%${type}%` };
    }
    if (capacity) {
      roomTypeWhere.capacity = parseInt(capacity);
    }

    // Add price filter to roomTypeWhere
    const { minPrice, maxPrice } = filters;
    if (minPrice !== undefined || maxPrice !== undefined) {
      roomTypeWhere.base_price = {};
      if (minPrice !== undefined) {
        roomTypeWhere.base_price[Op.gte] = parseFloat(minPrice);
      }
      if (maxPrice !== undefined) {
        roomTypeWhere.base_price[Op.lte] = parseFloat(maxPrice);
      }
    }

    // Add amenities filter to roomTypeWhere
    if (amenities) {
      const amenitiesArr = String(amenities)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      
      if (amenitiesArr.length > 0) {
        // Assuming amenities are stored as JSON array in room_types table
        // We use Op.and to ensure all requested amenities are present
        // Note: This depends on how amenities are stored and queried. 
        // If stored as JSON string, we might need multiple LIKE clauses.
        roomTypeWhere[Op.and] = amenitiesArr.map((a) => ({
          amenities: { [Op.like]: `%${a}%` },
        }));
      }
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const offset = (pageNum - 1) * limitNum;

    // Build where clause for available rooms
    const whereClause = { status: 'available' };
    
    // Get room types that have at least one room with status 'available'
    const { count, rows: availableRoomTypes } = await roomRepository.findAvailableRoomTypes(
      roomTypeWhere,
      whereClause,
      limitNum,
      offset
    );

    // Compute available count per type for the selected date range
    const typesWithAvailability = await Promise.all(
      availableRoomTypes.map(async (rt) => {
        const obj = rt.toJSON ? rt.toJSON() : { ...rt };

        // Fetch all rooms of this type that are currently 'available'
        const allRooms = await roomRepository.findRoomsByTypeAvailable(rt.id, {});

        // If no dates provided (shouldn't happen due to validation), use length
        if (!from || !to) {
          obj.available_count = allRooms.length;
        } else {
          // Get booked room IDs overlapping the date range
          const bookedIds = await roomRepository.findBookedRoomIdsByTypeInRange(
            rt.id,
            checkInDate,
            checkOutDate,
            null
          );
          const availableRooms = allRooms.filter((r) => !bookedIds.includes(r.id));
          obj.available_count = availableRooms.length;
        }

        // Attach review stats
        const stats = await roomRepository.getReviewStatsByRoomType(rt.id);
        obj.average_rating = stats?.average_rating
          ? Math.round(parseFloat(stats.average_rating) * 10) / 10
          : null;
        obj.total_reviews = stats?.total_reviews
          ? parseInt(stats.total_reviews, 10)
          : 0;

        // Normalize capacity to a number to avoid UI showing wrong values
        obj.capacity = Number(
          obj.capacity !== undefined ? obj.capacity : (rt.capacity ?? 0)
        );

        return obj;
      })
    );

    // Filter out room types that have zero availability in the selected range
    const filteredTypes = typesWithAvailability.filter(
      (rt) => (rt.available_count ?? 0) > 0
    );

    // Adjust pagination totals to reflect filtered results
    const totalFiltered = filteredTypes.length;

    return {
      rooms: filteredTypes,
      search: { from, to, type, capacity },
      pagination: {
        total: totalFiltered,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.max(1, Math.ceil(totalFiltered / limitNum)),
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

    // Save uploaded files as room-type images (images moved to room_types)
    const imageUrls = files.map(file => `/uploads/room_types/${file.filename}`);

    // Load room type and its existing images
    const roomType = await roomRepository.findRoomTypeById(room.room_type_id);
    if (!roomType) {
      const error = new Error('Room type not found');
      error.statusCode = 404;
      throw error;
    }

    const existing = this.parseImages(roomType.images);
    const updatedImages = [...existing, ...imageUrls];

    await roomRepository.updateRoomType(roomType, { images: updatedImages });

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

    const roomType = await roomRepository.findRoomTypeById(room.room_type_id);
    if (!roomType) {
      const error = new Error('Room type not found');
      error.statusCode = 404;
      throw error;
    }

    const existingImages = this.parseImages(roomType.images);
    const updatedImages = existingImages.filter(img => img !== imageUrl);

    // Delete file from disk
    this.deleteImageFile(imageUrl);

    // Update room_type images
    await roomRepository.updateRoomType(roomType, { images: updatedImages });

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

        // Keep room_type.images; front-end expects images on room_type now.

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
    const formatted = room.toJSON ? room.toJSON() : { ...room };
    try {
      if (formatted.room_type) {
        // It is a Room object
        const imgs = formatted.room_type.images;
        const normalized = this.normalizeImages(imgs, baseUrl);
        
        // ensure room_type is a plain object we can mutate
        const rt = formatted.room_type.toJSON ? formatted.room_type.toJSON() : { ...formatted.room_type };
        rt.images = normalized;
        formatted.room_type = rt;
        
        // remove any accidental top-level images to respect types
        if (Object.prototype.hasOwnProperty.call(formatted, 'images')) {
          delete formatted.images;
        }
      } else {
        // It is likely a RoomType object (or Room without room_type loaded)
        if (formatted.images) {
          formatted.images = this.normalizeImages(formatted.images, baseUrl);
        }
      }
    } catch (e) {
      // Fallback
      if (formatted.room_type) {
        const rt = formatted.room_type.toJSON ? formatted.room_type.toJSON() : { ...formatted.room_type };
        rt.images = [];
        formatted.room_type = rt;
      }
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
      const filePath = path.join(__dirname, '../../uploads/room_types', filename);
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
    const transaction = options.transaction;

    // Get room to find room_type_id via repository
    const room = await roomRepository.findRoomById(roomId);
    if (!room) return 0;

    const roomTypeId = room.room_type_id;

    // Count total rooms of this type with status 'available'
    const totalRooms = await roomRepository.countAvailableRoomsByType(roomTypeId, transaction);

    if (!checkInDate || !checkOutDate) {
      return totalRooms;
    }

    // Count booked rooms in date range using repository helper
    const bookedCount = await roomRepository.countBookedRoomsInRangeByType(
      roomTypeId,
      this.parseLocalDate(checkInDate),
      this.parseLocalDate(checkOutDate),
      transaction
    );

    const availableCount = Math.max(0, totalRooms - bookedCount);
    return availableCount;
  }

  /**
   * Get list of available room IDs of same type for date range
   */
  async getAvailableRoomsForType(roomId, checkInDate, checkOutDate, quantity, options = {}) {
    const transaction = options.transaction;

    // Get room to find room_type_id via repository
    const room = await roomRepository.findRoomById(roomId);
    if (!room) return [];

    const roomTypeId = room.room_type_id;

    // Get all available rooms of this type (may lock if transaction provided)
    const allRooms = await roomRepository.findRoomsByTypeAvailable(roomTypeId, {
      transaction,
      lock: !!transaction,
    });

    if (!checkInDate || !checkOutDate) {
      return allRooms.slice(0, quantity);
    }

    // Get booked room IDs in date range via repository
    const bookedIds = await roomRepository.findBookedRoomIdsByTypeInRange(
      roomTypeId,
      this.parseLocalDate(checkInDate),
      this.parseLocalDate(checkOutDate),
      transaction
    );

    const availableRooms = allRooms.filter((r) => !bookedIds.includes(r.id));
    return availableRooms.slice(0, quantity);
  }

  /**
   * Update room status (for staff)
   */
  async updateRoomStatus(roomId, status) {
    // Delegate DB operations to repository
    const updated = await roomRepository.updateRoomStatus(roomId, status);
    if (!updated) {
      const error = new Error('Room not found');
      error.statusCode = 404;
      throw error;
    }

    return updated;
  }
}

module.exports = new RoomService();
