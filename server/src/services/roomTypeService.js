const { RoomType } = require('../databases/models');

class RoomTypeService {
  async getRoomTypes() {
    const roomTypes = await RoomType.findAll({ order: [['id', 'ASC']] });
    
    // Parse JSON fields (images, amenities) if they are strings
    return roomTypes.map(rt => {
      const data = rt.toJSON();
      
      // Parse images if it's a string
      if (typeof data.images === 'string') {
        try {
          data.images = JSON.parse(data.images);
        } catch (e) {
          data.images = [];
        }
      }
      
      // Parse amenities if it's a string
      if (typeof data.amenities === 'string') {
        try {
          data.amenities = JSON.parse(data.amenities);
        } catch (e) {
          data.amenities = [];
        }
      }
      
      return data;
    });
  }

  async createRoomType(data) {
    // Convert arrays to JSON strings for database
    const createData = { ...data };
    if (Array.isArray(createData.images)) {
      createData.images = JSON.stringify(createData.images);
    }
    if (Array.isArray(createData.amenities)) {
      createData.amenities = JSON.stringify(createData.amenities);
    }
    
    const roomType = await RoomType.create(createData);
    const result = roomType.toJSON();
    
    // Parse back to arrays for response
    if (typeof result.images === 'string') {
      try { result.images = JSON.parse(result.images); } catch (e) { result.images = []; }
    }
    if (typeof result.amenities === 'string') {
      try { result.amenities = JSON.parse(result.amenities); } catch (e) { result.amenities = []; }
    }
    
    return result;
  }

  async updateRoomType(id, data) {
    const roomType = await RoomType.findByPk(id);
    if (!roomType) throw new Error('Room type not found');
    
    // Convert arrays to JSON strings for database
    const updateData = { ...data };
    if (Array.isArray(updateData.images)) {
      updateData.images = JSON.stringify(updateData.images);
    }
    if (Array.isArray(updateData.amenities)) {
      updateData.amenities = JSON.stringify(updateData.amenities);
    }
    
    await roomType.update(updateData);
    const result = roomType.toJSON();
    
    // Parse back to arrays for response
    if (typeof result.images === 'string') {
      try { result.images = JSON.parse(result.images); } catch (e) { result.images = []; }
    }
    if (typeof result.amenities === 'string') {
      try { result.amenities = JSON.parse(result.amenities); } catch (e) { result.amenities = []; }
    }
    
    return result;
  }

  async deleteRoomType(id) {
    const roomType = await RoomType.findByPk(id);
    if (!roomType) throw new Error('Room type not found');
    await roomType.destroy();
    return true;
  }
}

module.exports = new RoomTypeService();
