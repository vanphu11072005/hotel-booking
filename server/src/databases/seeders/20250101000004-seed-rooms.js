'use strict';

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const rooms = [];
    // Base timestamp (30 days ago)
    const baseTime = new Date();
    baseTime.setDate(baseTime.getDate() - 30);
    let roomIndex = 0;
    
    // Standard Single Rooms (Floor 1-2)
    for (let floor = 1; floor <= 2; floor++) {
      for (let room = 1; room <= 5; room++) {
        // Each room created 1 day after previous
        const createdAt = new Date(baseTime);
        createdAt.setDate(createdAt.getDate() + roomIndex);
        
        rooms.push({
          room_type_id: 1,
          room_number: `${floor}0${room}`,
          floor: floor,
          status: 'available',
          featured: false,
          price: 500000,
          images: JSON.stringify([
            '/uploads/rooms/standard-single-1.jpg',
            '/uploads/rooms/standard-single-2.jpg',
            '/uploads/rooms/standard-single-3.jpg',
            '/uploads/rooms/standard-single-4.jpg',
            '/uploads/rooms/standard-single-5.jpg',
          ]),
          description: 
            `Standard single room on floor ${floor}`,
          created_at: createdAt,
          updated_at: createdAt
        });
        
        roomIndex++;
      }
    }

    // Standard Double Rooms (Floor 3-4)
    for (let floor = 3; floor <= 4; floor++) {
      for (let room = 1; room <= 8; room++) {
        const createdAt = new Date(baseTime);
        createdAt.setDate(createdAt.getDate() + roomIndex);
        
        rooms.push({
          room_type_id: 2,
          room_number: `${floor}0${room}`,
          floor: floor,
          status: 'available',
          featured: false,
          price: 800000,
          images: JSON.stringify([
            '/uploads/rooms/standard-double-1.jpg',
            '/uploads/rooms/standard-double-2.jpg',
            '/uploads/rooms/standard-double-3.jpg',
            '/uploads/rooms/standard-double-4.jpg',
            '/uploads/rooms/standard-double-5.jpg',
          ]),
          description: 
            `Standard double room on floor ${floor}`,
          created_at: createdAt,
          updated_at: createdAt
        });
        
        roomIndex++;
      }
    }

    // Deluxe Rooms (Floor 5-7)
    for (let floor = 5; floor <= 7; floor++) {
      for (let room = 1; room <= 6; room++) {
        const createdAt = new Date(baseTime);
        createdAt.setDate(createdAt.getDate() + roomIndex);
        
        rooms.push({
          room_type_id: 3,
          room_number: `${floor}0${room}`,
          floor: floor,
          status: 'available',
          featured: false,
          price: 1200000,
          images: JSON.stringify([
            '/uploads/rooms/deluxe-1.jpg',
            '/uploads/rooms/deluxe-2.jpg',
            '/uploads/rooms/deluxe-3.jpg',
            '/uploads/rooms/deluxe-4.jpg'
          ]),
          description: 
            `Deluxe room on floor ${floor} with city view`,
          created_at: createdAt,
          updated_at: createdAt
        });
        
        roomIndex++;
      }
    }

    // Family Suites (Floor 8-9)
    for (let floor = 8; floor <= 9; floor++) {
      for (let room = 1; room <= 4; room++) {
        const createdAt = new Date(baseTime);
        createdAt.setDate(createdAt.getDate() + roomIndex);
        
        rooms.push({
          room_type_id: 4,
          room_number: `${floor}0${room}`,
          floor: floor,
          status: 'available',
          featured: false,
          price: 2000000,
          images: JSON.stringify([
            '/uploads/rooms/family-suite-1.jpg',
            '/uploads/rooms/family-suite-2.jpg',
            '/uploads/rooms/family-suite-3.jpg',
            '/uploads/rooms/family-suite-4.jpg',
            '/uploads/rooms/family-suite-5.jpg'
          ]),
          description: 
            `Family suite on floor ${floor}`,
          created_at: createdAt,
          updated_at: createdAt
        });
        
        roomIndex++;
      }
    }

    // Presidential Suites (Floor 10)
    for (let room = 1; room <= 2; room++) {
      const createdAt = new Date(baseTime);
      createdAt.setDate(createdAt.getDate() + roomIndex);
      
      rooms.push({
        room_type_id: 5,
        room_number: `100${room}`,
        floor: 10,
        status: 'available',
        featured: false,
        price: 5000000,
        images: JSON.stringify([
          '/uploads/rooms/presidential-1.jpg',
          '/uploads/rooms/presidential-2.jpg',
          '/uploads/rooms/presidential-3.jpg',
          '/uploads/rooms/presidential-4.jpg',
          '/uploads/rooms/presidential-5.jpg',
          '/uploads/rooms/presidential-6.jpg'
        ]),
        description: 
          'Presidential suite with panoramic city view',
        created_at: createdAt,
        updated_at: createdAt
      });
      
      roomIndex++;
    }

    // Mark some rooms as occupied for realism
    rooms[0].status = 'occupied';
    rooms[5].status = 'occupied';
    rooms[12].status = 'cleaning';
    rooms[20].status = 'maintenance';

    // Randomly select 3 room types from 5 available types
    // Each selected type will have 3 featured rooms
    const allRoomTypes = [1, 2, 3, 4, 5];
    
    // Shuffle array and pick first 3
    const shuffled = allRoomTypes.sort(() => Math.random() - 0.5);
    const selectedTypes = shuffled.slice(0, 3);
    
    console.log('Selected featured room types:', selectedTypes);
    
    // Mark 3 rooms as featured for each selected type
    for (const typeId of selectedTypes) {
      const roomsOfType = rooms
        .map((room, idx) => ({ room, idx }))
        .filter(({ room }) => room.room_type_id === typeId);
      
      // Randomly select 3 rooms of this type
      const shuffledRooms = roomsOfType.sort(() => Math.random() - 0.5);
      const selectedRooms = shuffledRooms.slice(0, 3);
      
      // Mark them as featured
      selectedRooms.forEach(({ idx }) => {
        rooms[idx].featured = true;
      });
    }

    await queryInterface.bulkInsert('rooms', rooms);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('rooms', null, {});
  }
};
