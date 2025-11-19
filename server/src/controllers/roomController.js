const roomService = require('../services/roomService');

/**
 * Room Controller - Request/Response handling layer
 * Xử lý HTTP requests và responses
 */

/**
 * Get all room types
 */
const getRoomTypes = async (req, res, next) => {
  try {
    const roomTypes = await roomService.getRoomTypes();

    res.status(200).json({
      status: 'success',
      data: { room_types: roomTypes },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all rooms with filters
 */
const getRooms = async (req, res, next) => {
  try {
    const filters = req.query;

    // Get rooms from service
    const result = await roomService.getRooms(filters);

    // Format image URLs to absolute URLs
    const baseUrl = process.env.SERVER_URL || `http://${req.get('host')}`;
    const formattedRooms = roomService.formatRoomsImages(
      result.rooms,
      baseUrl
    );

    res.status(200).json({
      status: 'success',
      data: {
        rooms: formattedRooms,
        pagination: result.pagination,
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

    // Get room from service
    const room = await roomService.getRoomById(id);

    // Format image URL to absolute URL
    const baseUrl = process.env.SERVER_URL || `http://${req.get('host')}`;
    const formattedRoom = roomService.formatRoomImages(room, baseUrl);

    res.status(200).json({
      status: 'success',
      data: {
        room: formattedRoom,
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
    const amenities = await roomService.getAmenities();

    res.status(200).json({
      status: 'success',
      data: { amenities },
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
    const filters = req.query;

    // Get available rooms from service
    const result = await roomService.searchAvailableRooms(filters);

    // Format image URLs to absolute URLs
    const baseUrl = process.env.SERVER_URL || `http://${req.get('host')}`;
    const formattedRooms = roomService.formatRoomsImages(
      result.rooms,
      baseUrl
    );

    res.status(200).json({
      status: 'success',
      data: {
        rooms: formattedRooms,
        search: result.search,
        pagination: result.pagination,
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
    const roomData = req.body;

    // Create room via service
    const room = await roomService.createRoom(roomData);

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
    const updateData = req.body;

    // Update room via service
    const room = await roomService.updateRoom(id, updateData);

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

    // Delete room via service
    await roomService.deleteRoom(id);

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
    const files = req.files;

    // Upload images via service
    const updatedImages = await roomService.uploadRoomImages(id, files);

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
      roomService.cleanupUploadedFiles(req.files);
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

    // Delete image via service
    const updatedImages = await roomService.deleteRoomImage(id, imageUrl);

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
