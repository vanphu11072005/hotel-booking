const roomTypeService = require('../services/roomTypeService');

// Get all room types
const getRoomTypes = async (req, res, next) => {
  try {
    const roomTypes = await roomTypeService.getRoomTypes();
    res.status(200).json({ status: 'success', data: { room_types: roomTypes } });
  } catch (error) {
    next(error);
  }
};

// Create room type
const createRoomType = async (req, res, next) => {
  try {
    const roomType = await roomTypeService.createRoomType(req.body);
    res.status(201).json({ status: 'success', message: 'Room type created', data: { room_type: roomType } });
  } catch (error) {
    next(error);
  }
};

// Update room type
const updateRoomType = async (req, res, next) => {
  try {
    const roomType = await roomTypeService.updateRoomType(req.params.id, req.body);
    res.status(200).json({ status: 'success', message: 'Room type updated', data: { room_type: roomType } });
  } catch (error) {
    next(error);
  }
};

// Delete room type
const deleteRoomType = async (req, res, next) => {
  try {
    await roomTypeService.deleteRoomType(req.params.id);
    res.status(200).json({ status: 'success', message: 'Room type deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRoomTypes,
  createRoomType,
  updateRoomType,
  deleteRoomType,
};
