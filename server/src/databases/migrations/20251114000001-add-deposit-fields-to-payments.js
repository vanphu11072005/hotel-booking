'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add payment_type field to payments table
    await queryInterface.addColumn('payments', 'payment_type', {
      type: Sequelize.ENUM('full', 'deposit', 'remaining'),
      allowNull: false,
      defaultValue: 'full',
      after: 'payment_method'
    });

    // Add deposit_percentage field
    await queryInterface.addColumn('payments', 'deposit_percentage', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
      comment: 'Percentage of deposit (e.g., 20, 30, 50)',
      after: 'payment_type'
    });

    // Add reference to original payment if this is a remaining payment
    await queryInterface.addColumn('payments', 'related_payment_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'payments',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      after: 'booking_id'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('payments', 'related_payment_id');
    await queryInterface.removeColumn('payments', 'deposit_percentage');
    await queryInterface.removeColumn('payments', 'payment_type');
  }
};
