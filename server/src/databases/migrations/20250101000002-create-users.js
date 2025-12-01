'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      role_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'roles',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      full_name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      avatar: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      lock_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      login_attempts: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      locked_until: {
        type: Sequelize.DATE,
        allowNull: true
      },
      last_failed_login: {
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

    await queryInterface.addIndex('users', ['email']);
    await queryInterface.addIndex('users', ['role_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  }
};
