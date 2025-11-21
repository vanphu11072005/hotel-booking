'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('bookings', 'parent_booking_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'ID của booking cha (dùng để group multi-room bookings)',
      references: {
        model: 'bookings',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.addColumn('bookings', 'room_quantity', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: 'Số lượng phòng cùng loại được đặt'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('bookings', 'parent_booking_id');
    await queryInterface.removeColumn('bookings', 'room_quantity');
  }
};
