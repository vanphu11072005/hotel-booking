"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add nullable booking_id column first
    await queryInterface.addColumn('reviews', 'booking_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'bookings',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Add unique index to ensure one review per booking when booking_id is provided
    await queryInterface.addIndex('reviews', ['booking_id'], {
      name: 'reviews_booking_id_unique',
      unique: true,
      where: {
        booking_id: { [Sequelize.Op.ne]: null }
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('reviews', 'reviews_booking_id_unique');
    await queryInterface.removeColumn('reviews', 'booking_id');
  }
};
