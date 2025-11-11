'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('rooms', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      room_type_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'room_types',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      room_number: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true
      },
      floor: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM(
          'available',
          'occupied',
          'maintenance',
          'cleaning'
        ),
        allowNull: false,
        defaultValue: 'available'
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      images: {
        type: Sequelize.JSON,
        allowNull: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
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

    await queryInterface.addIndex('rooms', ['room_type_id']);
    await queryInterface.addIndex('rooms', ['status']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('rooms');
  }
};
