'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add deposit tracking fields to bookings table
    await queryInterface.addColumn('bookings', 'deposit_paid', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      after: 'status'
    });

    await queryInterface.addColumn('bookings', 'requires_deposit', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      after: 'deposit_paid'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('bookings', 'requires_deposit');
    await queryInterface.removeColumn('bookings', 'deposit_paid');
  }
};
