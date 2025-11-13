'use strict';

/** @type {import('sequelize-cli').Seeder} */
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
          featured: false,
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
          featured: false,
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
        created_at: new Date(),
        updated_at: new Date()
      });
    }

    // Mark some rooms as occupied for realism
    rooms[0].status = 'occupied';
    rooms[5].status = 'occupied';
    rooms[12].status = 'cleaning';
    rooms[20].status = 'maintenance';

    // Ensure there are always 10 featured rooms in the seed data.
    // Strategy: prefer higher-tier room types first (presidential ->
    // family -> deluxe -> double -> single) and mark rooms until
    // we reach `desiredFeaturedCount`.
    const desiredFeaturedCount = 10;
    let featuredMarked = 0;

    // Helper: mark room at index if exists and not already featured
    const markIf = (idx) => {
      if (idx >= 0 && idx < rooms.length && !rooms[idx].featured) {
        rooms[idx].featured = true;
        featuredMarked += 1;
      }
    };

    // Priority order by room_type_id (higher-tier first)
    const priority = [5, 4, 3, 2, 1];

    for (const typeId of priority) {
      if (featuredMarked >= desiredFeaturedCount) break;

      // iterate rooms and pick the first ones of this type
      for (let i = 0; i < rooms.length; i++) {
        if (rooms[i].room_type_id === typeId) {
          markIf(i);
          if (featuredMarked >= desiredFeaturedCount) break;
        }
      }
    }

    // If still not enough, mark remaining rooms starting from end
    for (let i = rooms.length - 1; i >= 0 && featuredMarked < desiredFeaturedCount; i--) {
      markIf(i);
    }

    await queryInterface.bulkInsert('rooms', rooms);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('rooms', null, {});
  }
};
