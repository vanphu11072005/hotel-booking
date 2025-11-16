'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('services', 'unit', {
      type: Sequelize.STRING(50),
      allowNull: true,
      defaultValue: 'lần',
      after: 'price'
    });

    await queryInterface.addColumn('services', 'status', {
      type: Sequelize.ENUM('active', 'inactive'),
      allowNull: false,
      defaultValue: 'active',
      after: 'category'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('services', 'unit');
    await queryInterface.removeColumn('services', 'status');
  }
};
