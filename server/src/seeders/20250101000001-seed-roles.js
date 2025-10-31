'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('roles', [
      {
        id: 1,
        name: 'admin',
        description: 'Administrator with full system access',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        name: 'staff',
        description: 
          'Staff member handling bookings and operations',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 3,
        name: 'customer',
        description: 'Customer who can book rooms',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('roles', null, {});
  }
};
