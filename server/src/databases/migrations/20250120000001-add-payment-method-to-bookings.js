'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('bookings', 'payment_method', {
      type: Sequelize.ENUM('cash', 'bank_transfer', 'vnpay'),
      allowNull: true,
      defaultValue: 'cash',
      after: 'total_price'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('bookings', 'payment_method');
  }
};
