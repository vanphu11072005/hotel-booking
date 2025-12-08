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
    // No need to stringify - Sequelize with JSON type will handle it
    const roomType = await RoomType.create(data);
    return roomType.toJSON();
  }

  async updateRoomType(id, data) {
    const roomType = await RoomType.findByPk(id);
    if (!roomType) throw new Error('Room type not found');
    
    // No need to stringify - Sequelize with JSON type will handle it
    await roomType.update(data);
    return roomType.toJSON();
  }

  async deleteRoomType(id) {
    const roomType = await RoomType.findByPk(id, {
      include: [{
        association: 'rooms',
        attributes: ['id']
      }]
    });
    
    if (!roomType) throw new Error('Room type not found');
    
    // Check if there are rooms using this room type
    if (roomType.rooms && roomType.rooms.length > 0) {
      throw new Error(`Cannot delete room type. There are ${roomType.rooms.length} room(s) using this type. Please delete or reassign those rooms first.`);
    }
    
    await roomType.destroy();
    return true;
  }
}

module.exports = new RoomTypeService();
