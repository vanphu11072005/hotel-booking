'use strict';

const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('password123', 10);

    await queryInterface.bulkInsert('users', [
      {
        id: 1,
        role_id: 1,
        email: 'admin@hotel.com',
        password: hashedPassword,
        full_name: 'Admin User',
        phone: '0901234567',
        address: '123 Admin Street, District 1, HCMC',
        avatar: null,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        role_id: 2,
        email: 'staff@hotel.com',
        password: hashedPassword,
        full_name: 'Staff Member',
        phone: '0902345678',
        address: '456 Staff Avenue, District 3, HCMC',
        avatar: null,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 3,
        role_id: 2,
        email: 'staff2@hotel.com',
        password: hashedPassword,
        full_name: 'Staff Member 2',
        phone: '0903456789',
        address: '789 Staff Road, District 5, HCMC',
        avatar: null,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 4,
        role_id: 3,
        email: 'customer1@gmail.com',
        password: hashedPassword,
        full_name: 'Nguyen Van A',
        phone: '0904567890',
        address: '111 Customer Street, District 7, HCMC',
        avatar: null,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 5,
        role_id: 3,
        email: 'customer2@gmail.com',
        password: hashedPassword,
        full_name: 'Tran Thi B',
        phone: '0905678901',
        address: '222 Customer Avenue, District 10, HCMC',
        avatar: null,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 6,
        role_id: 3,
        email: 'customer3@gmail.com',
        password: hashedPassword,
        full_name: 'Le Van C',
        phone: '0906789012',
        address: '333 Customer Road, Binh Thanh, HCMC',
        avatar: null,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
