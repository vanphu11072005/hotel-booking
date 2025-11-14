const { Room, RoomType, Review, sequelize, Sequelize } = require('../databases/models');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');

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
    } = req.query;

    const whereClause = {};
    const roomTypeWhere = {};

    // Filter by featured
    if (featured !== undefined) {
      whereClause.featured = 
        featured === 'true' || featured === true;
    }

    // Filter by room type
    if (type) {
      roomTypeWhere.name = { [Op.like]: `%${type}%` };
    }

    // Filter by capacity
    if (capacity) {
      roomTypeWhere.capacity = { [Op.gte]: parseInt(capacity) };
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
    const { count, rows: rooms } = await Room.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: RoomType,
          as: 'room_type',
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

        return {
          ...room.toJSON(),
          average_rating: reviewStats?.average_rating
            ? Math.round(parseFloat(reviewStats.average_rating) * 10) / 10
            : null,
          total_reviews: reviewStats?.total_reviews
            ? parseInt(reviewStats.total_reviews, 10)
            : 0,
        };
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

    const roomData = {
      ...room.toJSON(),
      average_rating: reviewStats?.average_rating
        ? Math.round(parseFloat(reviewStats.average_rating) * 10) / 10
        : null,
      total_reviews: reviewStats?.total_reviews
        ? parseInt(reviewStats.total_reviews, 10)
        : 0,
    };

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
      roomTypeWhere.capacity = { [Op.gte]: parseInt(capacity) };
    }

    // Pagination params
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const offset = (pageNum - 1) * limitNum;

    // Get available rooms with pagination
    const { count, rows: availableRooms } = await Room.findAndCountAll({
      where: {
        status: 'available',
      },
      include: [
        {
          model: RoomType,
          as: 'room_type',
          where: Object.keys(roomTypeWhere).length > 0
            ? roomTypeWhere
            : undefined,
        },
      ],
      limit: limitNum,
      offset,
      order: [['featured', 'DESC'], ['created_at', 'DESC']],
      distinct: true,
    });

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

        return {
          ...room.toJSON(),
          average_rating: reviewStats?.average_rating
            ? Math.round(parseFloat(reviewStats.average_rating) * 10) / 10
            : null,
          total_reviews: reviewStats?.total_reviews
            ? parseInt(reviewStats.total_reviews, 10)
            : 0,
        };
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
    
    // Get existing images from room_type
    const existingImages = room.room_type.images || [];
    
    // Append new images
    const updatedImages = [...existingImages, ...imageUrls];

    // Update room_type images
    await room.room_type.update({
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

    // Get existing images
    const existingImages = room.room_type.images || [];
    
    // Remove the specified image
    const updatedImages = existingImages.filter(img => img !== imageUrl);

    // Delete file from disk
    const filename = path.basename(imageUrl);
    const filePath = path.join(__dirname, '../../uploads/rooms', filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Update room_type images
    await room.room_type.update({
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
  searchAvailableRooms,
  createRoom,
  updateRoom,
  deleteRoom,
  uploadRoomImages,
  deleteRoomImage,
};
