'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('bookings', 'guest_info', {
      type: Sequelize.JSON,
      allowNull: true,
      after: 'num_guests',
      comment: 'Thông tin khách đặt phòng (full_name, email, phone)'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('bookings', 'guest_info');
  }
};
