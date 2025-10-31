'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 6);

    await queryInterface.bulkInsert('promotions', [
      {
        id: 1,
        code: 'WELCOME2025',
        name: 'Welcome 2025',
        description: 
          '20% discount for new customers on first booking',
        discount_type: 'percentage',
        discount_value: 20,
        min_booking_amount: 1000000,
        max_discount_amount: 500000,
        start_date: now,
        end_date: futureDate,
        usage_limit: 100,
        used_count: 15,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        code: 'SUMMER2025',
        name: 'Summer Special',
        description: 
          'Fixed 300,000 VND discount for summer bookings',
        discount_type: 'fixed_amount',
        discount_value: 300000,
        min_booking_amount: 2000000,
        max_discount_amount: null,
        start_date: now,
        end_date: futureDate,
        usage_limit: 50,
        used_count: 8,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 3,
        code: 'WEEKEND15',
        name: 'Weekend Getaway',
        description: '15% off for weekend bookings',
        discount_type: 'percentage',
        discount_value: 15,
        min_booking_amount: 800000,
        max_discount_amount: 400000,
        start_date: now,
        end_date: futureDate,
        usage_limit: null,
        used_count: 25,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 4,
        code: 'FAMILY500',
        name: 'Family Package',
        description: 
          '500,000 VND off for family suite bookings',
        discount_type: 'fixed_amount',
        discount_value: 500000,
        min_booking_amount: 3000000,
        max_discount_amount: null,
        start_date: now,
        end_date: futureDate,
        usage_limit: 30,
        used_count: 5,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 5,
        code: 'LONGSTAY25',
        name: 'Long Stay Discount',
        description: '25% off for bookings 5 nights or more',
        discount_type: 'percentage',
        discount_value: 25,
        min_booking_amount: 5000000,
        max_discount_amount: 2000000,
        start_date: now,
        end_date: futureDate,
        usage_limit: null,
        used_count: 3,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 6,
        code: 'EARLYBIRD10',
        name: 'Early Bird Special',
        description: 
          '10% discount for bookings 30 days in advance',
        discount_type: 'percentage',
        discount_value: 10,
        min_booking_amount: 500000,
        max_discount_amount: 300000,
        start_date: now,
        end_date: futureDate,
        usage_limit: null,
        used_count: 42,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 7,
        code: 'VIP1000',
        name: 'VIP Member Exclusive',
        description: '1,000,000 VND off for VIP members',
        discount_type: 'fixed_amount',
        discount_value: 1000000,
        min_booking_amount: 10000000,
        max_discount_amount: null,
        start_date: now,
        end_date: futureDate,
        usage_limit: 10,
        used_count: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('promotions', null, {});
  }
};
