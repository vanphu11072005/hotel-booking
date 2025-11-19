/**
 * Get all room types
 */
const getRoomTypes = async (req, res, next) => {
  try {
    const roomTypes = await RoomType.findAll({
      attributes: ['id', 'name', 'description', 'base_price', 'capacity', 'amenities', 'created_at', 'updated_at'],
      order: [['id', 'ASC']],
    });
    res.status(200).json({
      status: 'success',
      data: { room_types: roomTypes },
    });
  } catch (error) {
    next(error);
  }
};
const { Room, RoomType, Review, sequelize, Sequelize } = require('../databases/models');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');

// Normalize image paths stored in DB (relative) to absolute URLs
const normalizeImages = (images, baseUrl) => {
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
};

// Safe RoomType attributes used in includes to avoid selecting
// a possibly-missing `images` column on some DB schemas.
const roomTypeAttributes = [
  'id',
  'name',
  'description',
  'base_price',
  'capacity',
  'amenities',
  'created_at',
  'updated_at',
];

/**
 * Get all rooms with filters
 */
const getRooms = async (req, res, next) => {
  try {
    const {
      type,
      minPrice,
      maxPrice,
      capacity,
      page = 1,
      limit = 10,
      sort,
      featured,
      search,
      status,
    } = req.query;

    const whereClause = {};
    const roomTypeWhere = {};

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
      whereClause.featured = 
        featured === 'true' || featured === true;
    }

    // Filter by room type (ID or name)
    if (type) {
      // Check if type is a number (ID) or string (name)
      if (!isNaN(type)) {
        whereClause.room_type_id = parseInt(type);
      } else {
        roomTypeWhere.name = { [Op.like]: `%${type}%` };
      }
    }
    // Filter by amenities (comma-separated list). When user selects
    // multiple amenities we require rooms to have ALL selected
    // amenities (AND). A room matches an amenity if either the
    // room_type.amenities or the room.amenities contains the value.
    if (req.query.amenities) {
      const amenitiesArr = String(req.query.amenities)
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
    // Filter by capacity
    if (capacity) {
      // Require exact capacity match (e.g. searching for 1 returns
      // only room types that support 1). Use equality to avoid
      // returning larger-capacity rooms when user requests a
      // specific guest count.
      roomTypeWhere.capacity = { [Op.eq]: parseInt(capacity) };
    }

    // Filter by price
    if (minPrice || maxPrice) {
      roomTypeWhere.base_price = {};
      if (minPrice) {
        roomTypeWhere.base_price[Op.gte] = 
          parseFloat(minPrice);
      }
      if (maxPrice) {
        roomTypeWhere.base_price[Op.lte] = 
          parseFloat(maxPrice);
      }
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Sorting: support `sort=newest` to order strictly by created_at
    // Default: featured first then created_at desc
    let order = [
      ['featured', 'DESC'],
      ['created_at', 'DESC'],
    ];
    if (sort === 'newest' || sort === 'created_at') {
      order = [['created_at', 'DESC']];
    }

    // Get rooms with room type and reviews
    const roomTypeAttributes = [
      'id',
      'name',
      'description',
      'base_price',
      'capacity',
      'amenities',
      'created_at',
      'updated_at',
    ];

    const { count, rows: rooms } = await Room.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: RoomType,
          as: 'room_type',
          attributes: roomTypeAttributes,
          where: Object.keys(roomTypeWhere).length > 0
            ? roomTypeWhere
            : undefined,
          required: true,
        },
      ],
      limit: limitNum,
      offset,
      order,
      distinct: true,
    });

    // compute base url for images
    const baseUrl = process.env.SERVER_URL || `http://${req.get('host')}`;

    // Get average rating for each room
    const roomsWithRatings = await Promise.all(
      rooms.map(async (room) => {
        const reviewStats = await Review.findOne({
          where: {
            room_id: room.id,
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

        const item = {
          ...room.toJSON(),
          average_rating: reviewStats?.average_rating
            ? Math.round(parseFloat(reviewStats.average_rating) * 10) / 10
            : null,
          total_reviews: reviewStats?.total_reviews
            ? parseInt(reviewStats.total_reviews, 10)
            : 0,
        };

        // Normalize images for room only. Room types no longer carry
        // an `images` column in the canonical schema; keep room_type
        // without images to avoid confusion.
        try {
          item.images = normalizeImages(item.images, baseUrl);
        } catch (e) {
          item.images = [];
        }
        if (item.room_type) {
          // Ensure the room_type does not expose an images field
          delete item.room_type.images;
        }

        return item;
      })
    );

    res.status(200).json({
      status: 'success',
      data: {
        rooms: roomsWithRatings,
        pagination: {
          total: count,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(count / limitNum),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get room by ID
 */
const getRoomById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const roomTypeAttributes = [
      'id',
      'name',
      'description',
      'base_price',
      'capacity',
      'amenities',
      'created_at',
      'updated_at',
    ];

    const room = await Room.findByPk(id, {
      include: [
        {
          model: RoomType,
          as: 'room_type',
          attributes: roomTypeAttributes,
        },
      ],
    });

    if (!room) {
      return res.status(404).json({
        status: 'error',
        message: 'Room not found',
      });
    }

    // Get average rating
    const reviewStats = await Review.findOne({
      where: {
        room_id: room.id,
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

    const baseUrl = process.env.SERVER_URL || `http://${req.get('host')}`;

    const roomData = {
      ...room.toJSON(),
      average_rating: reviewStats?.average_rating
        ? Math.round(parseFloat(reviewStats.average_rating) * 10) / 10
        : null,
      total_reviews: reviewStats?.total_reviews
        ? parseInt(reviewStats.total_reviews, 10)
        : 0,
    };

    // Normalize images at the room level only
    try {
      roomData.images = normalizeImages(roomData.images, baseUrl);
    } catch (e) {
      roomData.images = [];
    }
    if (roomData.room_type) {
      delete roomData.room_type.images;
    }

    res.status(200).json({
      status: 'success',
      data: {
        room: roomData,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get list of unique amenities from room_types and rooms
 */
const getAmenities = async (req, res, next) => {
  try {
    // Fetch amenities from RoomType and Room
    const roomTypes = await Room.sequelize.models.RoomType.findAll({
      attributes: ['amenities'],
      raw: true,
    });

    const rooms = await Room.findAll({
      attributes: ['amenities'],
      raw: true,
    });

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

    res.status(200).json({ status: 'success', data: { amenities: unique } });
  } catch (error) {
    next(error);
  }
};

/**
 * Search available rooms
 */
const searchAvailableRooms = async (req, res, next) => {
  try {
    const { from, to, type, capacity, page = 1, limit = 12 } = req.query;

    if (!from || !to) {
      return res.status(400).json({
        status: 'error',
        message: 'From and to dates are required',
      });
    }

    const checkInDate = new Date(from);
    const checkOutDate = new Date(to);

    if (checkInDate >= checkOutDate) {
      return res.status(400).json({
        status: 'error',
        message: 'Check-out date must be after check-in date',
      });
    }

    // Build room type filter
    const roomTypeWhere = {};
    if (type) {
      roomTypeWhere.name = { [Op.like]: `%${type}%` };
    }
    if (capacity) {
      // See note above: use exact match for capacity filter so
      // searching for N people returns room types with capacity == N.
      roomTypeWhere.capacity = { [Op.eq]: parseInt(capacity) };
    }

    // Pagination params
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const offset = (pageNum - 1) * limitNum;

    // Get available rooms with pagination
    // Build base where for availability and merge amenities clause
    const baseWhere = { status: 'available' };
    // If getAmenities added an Op.and in roomType searches above,
    // merge that into the baseWhere so the availability and
    // amenities requirements are applied together.
    if (req.query.amenities) {
      const amenitiesArr = String(req.query.amenities)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      if (amenitiesArr.length > 0) {
        baseWhere[Op.and] = amenitiesArr.map((a) => ({
          [Op.or]: [
            sequelize.where(sequelize.col('room_type.amenities'), {
              [Op.like]: `%${a}%`,
            }),
            { amenities: { [Op.like]: `%${a}%` } },
          ],
        }));
      }
    }

    const { count, rows: availableRooms } = await Room.findAndCountAll({
      where: baseWhere,
      include: [
        {
          model: RoomType,
          as: 'room_type',
          attributes: roomTypeAttributes,
          where: Object.keys(roomTypeWhere).length > 0
            ? roomTypeWhere
            : undefined,
          required: Object.keys(roomTypeWhere).length > 0 ? true : false,
        },
      ],
      limit: limitNum,
      offset,
      order: [['featured', 'DESC'], ['created_at', 'DESC']],
      distinct: true,
    });

    // compute base url for images
    const baseUrl = process.env.SERVER_URL || `http://${req.get('host')}`;

    // Get ratings for available rooms
    const roomsWithRatings = await Promise.all(
      availableRooms.map(async (room) => {
        const reviewStats = await Review.findOne({
          where: {
            room_id: room.id,
            status: 'approved',
          },
          attributes: [
            [
              sequelize.fn('AVG', sequelize.col('rating')),
              'average_rating',
            ],
            [
              sequelize.fn('COUNT', sequelize.col('id')),
              'total_reviews',
            ],
          ],
          raw: true,
        });

        const item = {
          ...room.toJSON(),
          average_rating: reviewStats?.average_rating
            ? Math.round(parseFloat(reviewStats.average_rating) * 10) / 10
            : null,
          total_reviews: reviewStats?.total_reviews
            ? parseInt(reviewStats.total_reviews, 10)
            : 0,
        };

        // Normalize images at the room level only
        try {
          item.images = normalizeImages(item.images, baseUrl);
        } catch (e) {
          item.images = [];
        }
        if (item.room_type) {
          delete item.room_type.images;
        }

        return item;
      })
    );

    res.status(200).json({
      status: 'success',
      data: {
        rooms: roomsWithRatings,
        search: {
          from,
          to,
          type,
          capacity,
        },
        pagination: {
          total: count,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(count / limitNum),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new room (Admin only)
 */
const createRoom = async (req, res, next) => {
  try {
    const {
      room_type_id,
      room_number,
      floor,
      status,
      featured,
      price,
    } = req.body;

    // Check if room type exists
    const roomType = await RoomType.findByPk(room_type_id);
    if (!roomType) {
      return res.status(404).json({
        status: 'error',
        message: 'Room type not found',
      });
    }

    // Check if room number already exists
    const existingRoom = await Room.findOne({
      where: { room_number },
    });

    if (existingRoom) {
      return res.status(400).json({
        status: 'error',
        message: 'Room number already exists',
      });
    }

    const room = await Room.create({
      room_type_id,
      room_number,
      floor,
      status: status || 'available',
      featured: featured || false,
      price,
    });

    res.status(201).json({
      status: 'success',
      message: 'Room created successfully',
      data: {
        room,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update room (Admin only)
 */
const updateRoom = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      room_type_id,
      room_number,
      floor,
      status,
      featured,
    } = req.body;

    const room = await Room.findByPk(id);

    if (!room) {
      return res.status(404).json({
        status: 'error',
        message: 'Room not found',
      });
    }

    // Check if room type exists if updating
    if (room_type_id) {
      const roomType = await RoomType.findByPk(room_type_id);
      if (!roomType) {
        return res.status(404).json({
          status: 'error',
          message: 'Room type not found',
        });
      }
    }

    await room.update({
      room_type_id,
      room_number,
      floor,
      status,
      featured,
    });

    res.status(200).json({
      status: 'success',
      message: 'Room updated successfully',
      data: {
        room,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete room (Admin only)
 */
const deleteRoom = async (req, res, next) => {
  try {
    const { id } = req.params;

    const room = await Room.findByPk(id);

    if (!room) {
      return res.status(404).json({
        status: 'error',
        message: 'Room not found',
      });
    }

    await room.destroy();

    res.status(200).json({
      status: 'success',
      message: 'Room deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper function to parse images from database
 * Handles both array and JSON string
 */
const parseImages = (images) => {
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
};

/**
 * Upload room images
 * POST /api/rooms/:id/images
 */
const uploadRoomImages = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const room = await Room.findByPk(id, {
      include: [
        {
          model: RoomType,
          as: 'room_type',
        },
      ],
    });

    if (!room) {
      // Delete uploaded files if room not found
      if (req.files) {
        req.files.forEach(file => {
          fs.unlinkSync(file.path);
        });
      }
      return res.status(404).json({
        status: 'error',
        message: 'Room not found',
      });
    }

    // Get uploaded file URLs
    const imageUrls = req.files.map(file => `/uploads/rooms/${file.filename}`);
    
    // Get existing images from room_type and parse them
    const existingImages = parseImages(room.images);
    
    // Append new images
    const updatedImages = [...existingImages, ...imageUrls];

    // Update room images (store images at room level)
    await room.update({
      images: updatedImages,
    });

    res.status(200).json({
      status: 'success',
      message: 'Images uploaded successfully',
      data: {
        images: updatedImages,
      },
    });
  } catch (error) {
    // Clean up uploaded files on error
    if (req.files) {
      req.files.forEach(file => {
        try {
          fs.unlinkSync(file.path);
        } catch (err) {
          console.error('Error deleting file:', err);
        }
      });
    }
    next(error);
  }
};

/**
 * Delete room image
 * DELETE /api/rooms/:id/images
 */
const deleteRoomImage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { imageUrl } = req.body;

    const room = await Room.findByPk(id, {
      include: [
        {
          model: RoomType,
          as: 'room_type',
        },
      ],
    });

    if (!room) {
      return res.status(404).json({
        status: 'error',
        message: 'Room not found',
      });
    }

    // Get existing images and parse them (room-level)
    const existingImages = parseImages(room.images);
    
    // Remove the specified image
    const updatedImages = existingImages.filter(img => img !== imageUrl);

    // Delete file from disk
    const filename = path.basename(imageUrl);
    const filePath = path.join(__dirname, '../../uploads/rooms', filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Update room images (store images at room level)
    await room.update({
      images: updatedImages,
    });

    res.status(200).json({
      status: 'success',
      message: 'Image deleted successfully',
      data: {
        images: updatedImages,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRooms,
  getRoomById,
  getAmenities,
  searchAvailableRooms,
  createRoom,
  updateRoom,
  deleteRoom,
  uploadRoomImages,
  deleteRoomImage,
  getRoomTypes,
};
