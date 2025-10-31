'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 6);

    await queryInterface.bulkInsert('banners', [
      {
        id: 1,
        title: 'Welcome to Paradise Hotel',
        description: 
          'Experience luxury and comfort in the heart of ' +
          'the city',
        image_url: '/uploads/banners/banner-1.jpg',
        link_url: '/rooms',
        position: 'home',
        display_order: 1,
        is_active: true,
        start_date: now,
        end_date: futureDate,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        title: 'Summer Sale - Up to 30% Off',
        description: 
          'Book now and save big on your summer vacation',
        image_url: '/uploads/banners/banner-2.jpg',
        link_url: '/promotions',
        position: 'home',
        display_order: 2,
        is_active: true,
        start_date: now,
        end_date: futureDate,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 3,
        title: 'Presidential Suite',
        description: 
          'Indulge in ultimate luxury with our ' +
          'presidential suite',
        image_url: '/uploads/banners/banner-3.jpg',
        link_url: '/rooms/presidential-suite',
        position: 'home',
        display_order: 3,
        is_active: true,
        start_date: now,
        end_date: futureDate,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 4,
        title: 'Spa & Wellness Center',
        description: 
          'Relax and rejuvenate at our world-class spa',
        image_url: '/uploads/banners/banner-4.jpg',
        link_url: '/services#spa',
        position: 'home',
        display_order: 4,
        is_active: true,
        start_date: now,
        end_date: futureDate,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 5,
        title: 'Family Package Deal',
        description: 
          'Perfect getaway for the whole family with ' +
          'special rates',
        image_url: '/uploads/banners/banner-5.jpg',
        link_url: '/rooms?type=family',
        position: 'home',
        display_order: 5,
        is_active: true,
        start_date: now,
        end_date: futureDate,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 6,
        title: 'Meeting & Event Spaces',
        description: 
          'Host your next event in our elegant ' +
          'conference rooms',
        image_url: '/uploads/banners/banner-6.jpg',
        link_url: '/contact',
        position: 'services',
        display_order: 1,
        is_active: true,
        start_date: now,
        end_date: futureDate,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('banners', null, {});
  }
};
