'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('checkin_checkout', [
      // Completed check-in and check-out (booking 1)
      {
        id: 1,
        booking_id: 1,
        checkin_time: new Date('2025-01-15T14:30:00'),
        checkout_time: new Date('2025-01-18T11:45:00'),
        checkin_by: 2,
        checkout_by: 3,
        room_condition_checkin: 
          'Room in perfect condition. All amenities checked.',
        room_condition_checkout: 
          'Room left in good condition. Mini bar consumed ' +
          '2 items (added to bill).',
        additional_charges: 50000,
        notes: 
          'Guest very satisfied. Requested early breakfast.',
        created_at: new Date('2025-01-15'),
        updated_at: new Date('2025-01-18')
      },
      // Only checked in (booking 2)
      {
        id: 2,
        booking_id: 2,
        checkin_time: new Date('2025-01-28T15:15:00'),
        checkout_time: null,
        checkin_by: 2,
        checkout_by: null,
        room_condition_checkin: 
          'Room prepared and checked. Welcome package placed.',
        room_condition_checkout: null,
        additional_charges: 0,
        notes: 
          'Guest requested late check-out. Approved.',
        created_at: new Date('2025-01-28'),
        updated_at: new Date('2025-01-30')
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('checkin_checkout', null, {});
  }
};
