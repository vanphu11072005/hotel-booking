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
          'Single Bed',
          'Air Conditioning',
          'WiFi',
          'TV',
          'Private Bathroom',
          'Mini Fridge'
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
          'Double Bed',
          'Air Conditioning',
          'WiFi',
          'Smart TV',
          'Private Bathroom',
          'Mini Fridge',
          'Work Desk',
          'Safe Box'
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
          'King Size Bed',
          'Air Conditioning',
          'WiFi',
          'Smart TV',
          'Private Bathroom with Bathtub',
          'Mini Bar',
          'Work Desk',
          'Safe Box',
          'City View',
          'Balcony',
          'Coffee Machine'
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
          '2 Queen Beds',
          'Air Conditioning',
          'WiFi',
          'Smart TV',
          'Private Bathroom with Bathtub',
          'Mini Bar',
          'Living Area',
          'Sofa Bed',
          'Dining Table',
          'Safe Box',
          'City View',
          'Balcony',
          'Coffee Machine',
          'Kitchenette'
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
          'King Size Bed',
          'Additional Queen Bed',
          'Air Conditioning',
          'WiFi',
          'Multiple Smart TVs',
          'Luxury Bathroom with Jacuzzi',
          'Private Bar',
          'Living Room',
          'Dining Room',
          'Office Area',
          'Safe Box',
          'Panoramic City View',
          'Large Balcony',
          'Coffee Machine',
          'Full Kitchen',
          'Butler Service',
          'Private Entrance'
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
