'use strict';

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('room_types', [
      {
        id: 1,
        name: 'Standard Single',
        description: 
          'Cozy single room with basic amenities, ' +
          'perfect for solo travelers',
        base_price: 500000,
        capacity: 1,
        amenities: JSON.stringify([
          'Giường King',
          'Điều hòa',
          'Wi‑Fi',
          'TV thông minh',
          'Phòng tắm riêng',
          'Tủ lạnh mini'
        ]),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        name: 'Standard Double',
        description: 
          'Comfortable double room with modern facilities ' +
          'for couples or friends',
        base_price: 800000,
        capacity: 2,
        amenities: JSON.stringify([
          'Giường King',
          'Điều hòa',
          'Wi‑Fi',
          'TV thông minh',
          'Phòng tắm riêng',
          'Tủ lạnh mini',
          'Bàn làm việc',
          'Két an toàn'
        ]),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 3,
        name: 'Deluxe Room',
        description: 
          'Spacious deluxe room with premium amenities ' +
          'and city view',
        base_price: 1200000,
        capacity: 2,
        amenities: JSON.stringify([
          'Giường King',
          'Điều hòa',
          'Wi‑Fi',
          'TV thông minh',
          'Phòng tắm riêng',
          'Tủ lạnh mini',
          'Bàn làm việc',
          'Két an toàn',
          'Ban công',
          'Máy pha cà phê'
        ]),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 4,
        name: 'Family Suite',
        description: 
          'Large family suite with separate living area ' +
          'and multiple beds',
        base_price: 2000000,
        capacity: 4,
        amenities: JSON.stringify([
          'Giường King',
          'Điều hòa',
          'Wi‑Fi',
          'TV thông minh',
          'Phòng tắm riêng',
          'Tủ lạnh mini',
          'Bàn làm việc',
          'Két an toàn',
          'Ban công',
          'Máy pha cà phê'
        ]),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 5,
        name: 'Presidential Suite',
        description: 
          'Luxurious presidential suite with panoramic ' +
          'views and premium services',
        base_price: 5000000,
        capacity: 4,
        amenities: JSON.stringify([
          'Giường King',
          'Điều hòa',
          'Wi‑Fi',
          'TV thông minh',
          'Phòng tắm riêng',
          'Tủ lạnh mini',
          'Bàn làm việc',
          'Két an toàn',
          'Ban công',
          'Máy pha cà phê'
        ]),
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('room_types', null, {});
  }
};
