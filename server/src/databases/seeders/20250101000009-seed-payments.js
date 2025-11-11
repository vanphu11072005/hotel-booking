'use strict';

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('payments', [
      {
        id: 1,
        booking_id: 1,
        amount: 1500000,
        payment_method: 'credit_card',
        payment_status: 'completed',
        transaction_id: 'TXN2025011501234',
        payment_date: new Date('2025-01-15T10:30:00'),
        notes: 'Paid in full at check-in',
        created_at: new Date('2025-01-15'),
        updated_at: new Date('2025-01-15')
      },
      {
        id: 2,
        booking_id: 2,
        amount: 2400000,
        payment_method: 'bank_transfer',
        payment_status: 'completed',
        transaction_id: 'TXN2025012801567',
        payment_date: new Date('2025-01-28T09:15:00'),
        notes: 'Bank transfer confirmed',
        created_at: new Date('2025-01-28'),
        updated_at: new Date('2025-01-28')
      },
      {
        id: 3,
        booking_id: 3,
        amount: 1800000,
        payment_method: 'e_wallet',
        payment_status: 'completed',
        transaction_id: 'TXN2025012201890',
        payment_date: new Date('2025-01-22T14:20:00'),
        notes: '50% deposit paid',
        created_at: new Date('2025-01-22'),
        updated_at: new Date('2025-01-22')
      },
      {
        id: 4,
        booking_id: 4,
        amount: 8000000,
        payment_method: 'credit_card',
        payment_status: 'pending',
        transaction_id: null,
        payment_date: null,
        notes: 'Awaiting payment confirmation',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 5,
        booking_id: 5,
        amount: 7500000,
        payment_method: 'bank_transfer',
        payment_status: 'completed',
        transaction_id: 'TXN2025012502345',
        payment_date: new Date('2025-01-25T11:45:00'),
        notes: '50% deposit paid, balance due at check-in',
        created_at: new Date('2025-01-25'),
        updated_at: new Date('2025-01-25')
      },
      {
        id: 6,
        booking_id: 6,
        amount: 1600000,
        payment_method: 'credit_card',
        payment_status: 'refunded',
        transaction_id: 'TXN2025012003456',
        payment_date: new Date('2025-01-20T16:00:00'),
        notes: 
          'Booking cancelled, full refund processed',
        created_at: new Date('2025-01-20'),
        updated_at: new Date('2025-01-28')
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('payments', null, {});
  }
};
