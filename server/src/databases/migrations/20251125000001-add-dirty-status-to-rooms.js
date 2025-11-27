'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Modify the ENUM to include 'dirty' status
    await queryInterface.sequelize.query(`
      ALTER TABLE rooms 
      MODIFY COLUMN status ENUM('available', 'occupied', 'maintenance', 'dirty', 'cleaning') 
      NOT NULL DEFAULT 'available'
    `);
  },

  async down(queryInterface, Sequelize) {
    // Revert back to original ENUM values
    await queryInterface.sequelize.query(`
      ALTER TABLE rooms 
      MODIFY COLUMN status ENUM('available', 'occupied', 'maintenance', 'cleaning') 
      NOT NULL DEFAULT 'available'
    `);
  }
};
