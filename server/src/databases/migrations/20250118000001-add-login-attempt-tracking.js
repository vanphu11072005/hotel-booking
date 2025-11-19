'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'login_attempts', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Number of failed login attempts'
    });

    await queryInterface.addColumn('users', 'locked_until', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Account locked until this timestamp'
    });

    await queryInterface.addColumn('users', 'last_failed_login', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Timestamp of last failed login attempt'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'login_attempts');
    await queryInterface.removeColumn('users', 'locked_until');
    await queryInterface.removeColumn('users', 'last_failed_login');
  }
};
