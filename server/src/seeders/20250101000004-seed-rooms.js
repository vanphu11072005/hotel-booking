'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const rooms = [];
    
    // Standard Single Rooms (Floor 1-2)
    for (let floor = 1; floor <= 2; floor++) {
      for (let room = 1; room <= 5; room++) {
        rooms.push({
          room_type_id: 1,
          room_number: `${floor}0${room}`,
          floor: floor,
          status: 'available',
          price: 500000,
          images: JSON.stringify([
            '/uploads/rooms/standard-single-1.jpg',
            '/uploads/rooms/standard-single-2.jpg'
          ]),
          description: 
            `Standard single room on floor ${floor}`,
          created_at: new Date(),
          updated_at: new Date()
        });
      }
    }

    // Standard Double Rooms (Floor 3-4)
    for (let floor = 3; floor <= 4; floor++) {
      for (let room = 1; room <= 8; room++) {
        rooms.push({
          room_type_id: 2,
          room_number: `${floor}0${room}`,
          floor: floor,
          status: 'available',
          price: 800000,
          images: JSON.stringify([
            '/uploads/rooms/standard-double-1.jpg',
            '/uploads/rooms/standard-double-2.jpg',
            '/uploads/rooms/standard-double-3.jpg'
          ]),
          description: 
            `Standard double room on floor ${floor}`,
          created_at: new Date(),
          updated_at: new Date()
        });
      }
    }

    // Deluxe Rooms (Floor 5-7)
    for (let floor = 5; floor <= 7; floor++) {
      for (let room = 1; room <= 6; room++) {
        rooms.push({
          room_type_id: 3,
          room_number: `${floor}0${room}`,
          floor: floor,
          status: 'available',
          price: 1200000,
          images: JSON.stringify([
            '/uploads/rooms/deluxe-1.jpg',
            '/uploads/rooms/deluxe-2.jpg',
            '/uploads/rooms/deluxe-3.jpg',
            '/uploads/rooms/deluxe-4.jpg'
          ]),
          description: 
            `Deluxe room on floor ${floor} with city view`,
          created_at: new Date(),
          updated_at: new Date()
        });
      }
    }

    // Family Suites (Floor 8-9)
    for (let floor = 8; floor <= 9; floor++) {
      for (let room = 1; room <= 4; room++) {
        rooms.push({
          room_type_id: 4,
          room_number: `${floor}0${room}`,
          floor: floor,
          status: 'available',
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
          created_at: new Date(),
          updated_at: new Date()
        });
      }
    }

    // Presidential Suites (Floor 10)
    for (let room = 1; room <= 2; room++) {
      rooms.push({
        room_type_id: 5,
        room_number: `100${room}`,
        floor: 10,
        status: 'available',
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
        created_at: new Date(),
        updated_at: new Date()
      });
    }

    // Mark some rooms as occupied for realism
    rooms[0].status = 'occupied';
    rooms[5].status = 'occupied';
    rooms[12].status = 'cleaning';
    rooms[20].status = 'maintenance';

    await queryInterface.bulkInsert('rooms', rooms);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('rooms', null, {});
  }
};
