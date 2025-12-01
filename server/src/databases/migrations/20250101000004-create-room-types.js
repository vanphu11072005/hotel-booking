'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('room_types', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      base_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      capacity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      amenities: {
        type: Sequelize.JSON,
        allowNull: true
      },
      images: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: []
      },
      featured: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal(
          'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
        )
      }
    });
    await queryInterface.addIndex('room_types', ['featured']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('room_types');
  }
};
