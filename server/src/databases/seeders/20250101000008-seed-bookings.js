'use strict';

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const inTwoDays = new Date(now);
    inTwoDays.setDate(inTwoDays.getDate() + 2);
    
    const inFiveDays = new Date(now);
    inFiveDays.setDate(inFiveDays.getDate() + 5);

    await queryInterface.bulkInsert('bookings', [
      // Past booking (checked out)
      {
        id: 1,
        booking_number: 'BK2025010001',
        user_id: 4,
        room_id: 1,
        check_in_date: 
          new Date('2025-01-15T14:00:00'),
        check_out_date: 
          new Date('2025-01-18T12:00:00'),
        num_guests: 1,
        total_price: 1500000,
        status: 'checked_out',
        special_requests: null,
        created_at: new Date('2025-01-10'),
        updated_at: new Date('2025-01-18')
      },
      // Current booking (checked in)
      {
        id: 2,
        booking_number: 'BK2025010002',
        user_id: 5,
        room_id: 6,
        check_in_date: yesterday,
        check_out_date: inTwoDays,
        num_guests: 2,
        total_price: 2400000,
        status: 'checked_in',
        special_requests: 
          'Late check-out if possible',
        created_at: new Date('2025-01-20'),
        updated_at: now
      },
      // Upcoming confirmed booking
      {
        id: 3,
        booking_number: 'BK2025010003',
        user_id: 6,
        room_id: 20,
        check_in_date: inTwoDays,
        check_out_date: inFiveDays,
        num_guests: 2,
        total_price: 3600000,
        status: 'confirmed',
        special_requests: 
          'High floor room with city view',
        created_at: new Date('2025-01-22'),
        updated_at: new Date('2025-01-22')
      },
      // Pending booking
      {
        id: 4,
        booking_number: 'BK2025010004',
        user_id: 4,
        room_id: 35,
        check_in_date: tomorrow,
        check_out_date: inFiveDays,
        num_guests: 4,
        total_price: 8000000,
        status: 'pending',
        special_requests: 
          'Need baby cot and extra pillows',
        created_at: now,
        updated_at: now
      },
      // Upcoming booking for next week
      {
        id: 5,
        booking_number: 'BK2025010005',
        user_id: 5,
        room_id: 50,
        check_in_date: nextWeek,
        check_out_date: 
          new Date(nextWeek.getTime() + 3 * 24 * 60 * 60 * 1000),
        num_guests: 2,
        total_price: 15000000,
        status: 'confirmed',
        special_requests: 
          'Champagne and flowers for anniversary',
        created_at: new Date('2025-01-25'),
        updated_at: new Date('2025-01-25')
      },
      // Cancelled booking
      {
        id: 6,
        booking_number: 'BK2025010006',
        user_id: 6,
        room_id: 10,
        check_in_date: 
          new Date('2025-02-10T14:00:00'),
        check_out_date: 
          new Date('2025-02-12T12:00:00'),
        num_guests: 2,
        total_price: 1600000,
        status: 'cancelled',
        special_requests: null,
        created_at: new Date('2025-01-20'),
        updated_at: new Date('2025-01-28')
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('bookings', null, {});
  }
};
