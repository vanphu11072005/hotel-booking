'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('service_usages', [
      // Services for booking 1 (checked out)
      {
        id: 1,
        booking_id: 1,
        service_id: 1,
        quantity: 2,
        unit_price: 150000,
        total_price: 300000,
        usage_date: new Date('2025-01-16T07:30:00'),
        notes: 'Breakfast for 2 days',
        created_at: new Date('2025-01-16'),
        updated_at: new Date('2025-01-16')
      },
      {
        id: 2,
        booking_id: 1,
        service_id: 6,
        quantity: 3,
        unit_price: 60000,
        total_price: 180000,
        usage_date: new Date('2025-01-17T10:00:00'),
        notes: 'Regular laundry service',
        created_at: new Date('2025-01-17'),
        updated_at: new Date('2025-01-17')
      },
      // Services for booking 2 (checked in)
      {
        id: 3,
        booking_id: 2,
        service_id: 1,
        quantity: 1,
        unit_price: 150000,
        total_price: 150000,
        usage_date: new Date('2025-01-29T08:00:00'),
        notes: 'Room service breakfast',
        created_at: new Date('2025-01-29'),
        updated_at: new Date('2025-01-29')
      },
      {
        id: 4,
        booking_id: 2,
        service_id: 8,
        quantity: 1,
        unit_price: 500000,
        total_price: 500000,
        usage_date: new Date('2025-01-29T15:00:00'),
        notes: 'Traditional massage booking',
        created_at: new Date('2025-01-29'),
        updated_at: new Date('2025-01-29')
      },
      {
        id: 5,
        booking_id: 2,
        service_id: 16,
        quantity: 1,
        unit_price: 500000,
        total_price: 500000,
        usage_date: new Date('2025-01-30T12:00:00'),
        notes: 'Late check-out requested',
        created_at: new Date('2025-01-30'),
        updated_at: new Date('2025-01-30')
      },
      // Services pre-booked for booking 3
      {
        id: 6,
        booking_id: 3,
        service_id: 11,
        quantity: 1,
        unit_price: 400000,
        total_price: 400000,
        usage_date: new Date('2025-01-31'),
        notes: 'Airport pickup pre-booked',
        created_at: new Date('2025-01-22'),
        updated_at: new Date('2025-01-22')
      },
      // Services for booking 5
      {
        id: 7,
        booking_id: 5,
        service_id: 11,
        quantity: 1,
        unit_price: 400000,
        total_price: 400000,
        usage_date: new Date('2025-02-05'),
        notes: 'Airport pickup for anniversary trip',
        created_at: new Date('2025-01-25'),
        updated_at: new Date('2025-01-25')
      },
      {
        id: 8,
        booking_id: 5,
        service_id: 9,
        quantity: 1,
        unit_price: 700000,
        total_price: 700000,
        usage_date: new Date('2025-02-06T16:00:00'),
        notes: 'Aromatherapy session for couple',
        created_at: new Date('2025-01-25'),
        updated_at: new Date('2025-01-25')
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('service_usages', null, {});
  }
};
