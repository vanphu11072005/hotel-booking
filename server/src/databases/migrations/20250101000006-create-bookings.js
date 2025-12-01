'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('bookings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      booking_number: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      room_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'rooms',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      check_in_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      check_out_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      num_guests: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      guest_info: {
        type: Sequelize.JSON,
        allowNull: true
      },
      total_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      deposit_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0
      },
      payment_method: {
        type: Sequelize.ENUM('cash', 'bank_transfer', 'vnpay'),
        allowNull: true,
        defaultValue: 'cash'
      },
      parent_booking_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'bookings',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      room_quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      status: {
        type: Sequelize.ENUM(
          'pending',
          'confirmed',
          'checked_in',
          'checked_out',
          'cancelled'
        ),
        allowNull: false,
        defaultValue: 'pending'
      },
      deposit_paid: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      requires_deposit: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      special_requests: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      cancellation_reason: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      cancellation_details: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      cancelled_at: {
        type: Sequelize.DATE,
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

    await queryInterface.addIndex('bookings', ['booking_number']);
    await queryInterface.addIndex('bookings', ['user_id']);
    await queryInterface.addIndex('bookings', ['room_id']);
    await queryInterface.addIndex('bookings', ['status']);
    await queryInterface.addIndex('bookings', ['check_in_date']);
    await queryInterface.addIndex('bookings', ['check_out_date']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('bookings');
  }
};
