'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('services', [
      // Food & Beverage
      {
        id: 1,
        name: 'Room Service - Breakfast',
        description: 'Continental breakfast delivered to room',
        price: 150000,
        category: 'Food & Beverage',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        name: 'Room Service - Lunch',
        description: 'Lunch menu delivered to room',
        price: 250000,
        category: 'Food & Beverage',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 3,
        name: 'Room Service - Dinner',
        description: 'Dinner menu delivered to room',
        price: 300000,
        category: 'Food & Beverage',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 4,
        name: 'Mini Bar Refill',
        description: 'Refill mini bar with drinks and snacks',
        price: 200000,
        category: 'Food & Beverage',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      // Laundry
      {
        id: 5,
        name: 'Laundry Service - Express',
        description: 'Same day laundry service (per kg)',
        price: 100000,
        category: 'Laundry',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 6,
        name: 'Laundry Service - Regular',
        description: 'Next day laundry service (per kg)',
        price: 60000,
        category: 'Laundry',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 7,
        name: 'Dry Cleaning',
        description: 'Professional dry cleaning per item',
        price: 80000,
        category: 'Laundry',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      // Spa & Wellness
      {
        id: 8,
        name: 'Spa - Traditional Massage',
        description: '60 minutes traditional massage',
        price: 500000,
        category: 'Spa & Wellness',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 9,
        name: 'Spa - Aromatherapy',
        description: '90 minutes aromatherapy session',
        price: 700000,
        category: 'Spa & Wellness',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 10,
        name: 'Gym Access - Day Pass',
        description: 'Full day gym and pool access',
        price: 200000,
        category: 'Spa & Wellness',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      // Transportation
      {
        id: 11,
        name: 'Airport Pickup',
        description: 'Private car from airport to hotel',
        price: 400000,
        category: 'Transportation',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 12,
        name: 'Airport Drop-off',
        description: 'Private car from hotel to airport',
        price: 400000,
        category: 'Transportation',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 13,
        name: 'City Tour - Half Day',
        description: 'Half day city tour with guide',
        price: 800000,
        category: 'Transportation',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      // Other Services
      {
        id: 14,
        name: 'Extra Bed',
        description: 'Additional bed in room per night',
        price: 300000,
        category: 'Room Extras',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 15,
        name: 'Baby Cot',
        description: 'Baby cot in room per night',
        price: 100000,
        category: 'Room Extras',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 16,
        name: 'Late Check-out',
        description: 'Late check-out until 6 PM',
        price: 500000,
        category: 'Room Extras',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 17,
        name: 'Early Check-in',
        description: 'Early check-in from 6 AM',
        price: 500000,
        category: 'Room Extras',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('services', null, {});
  }
};
