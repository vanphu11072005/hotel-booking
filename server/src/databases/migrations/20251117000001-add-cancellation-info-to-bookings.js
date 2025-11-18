'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('bookings', 'cancellation_reason', {
      type: Sequelize.STRING(100),
      allowNull: true,
    });

    await queryInterface.addColumn('bookings', 'cancellation_details', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn('bookings', 'cancelled_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('bookings', 'cancellation_reason');
    await queryInterface.removeColumn('bookings', 'cancellation_details');
    await queryInterface.removeColumn('bookings', 'cancelled_at');
  },
};
