'use strict';

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 6);

    await queryInterface.bulkInsert('banners', [
      {
        id: 1,
        title: 'Chào mừng đến với khách sạn Paradise',
        description: 
          'Trải nghiệm sự sang trọng và tiện nghi ngay tại trung tâm thành phố',
        image_url: '/uploads/banners/banner-1.png',
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
        title: 'Nằm gần trung tâm thành phố',
        description: 
          'Book now and save big on your summer vacation',
        image_url: '/uploads/banners/banner-2.png',
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
        title: 'Khuyến mãi mùa hè - Giảm giá tới 30%',
        description: 
          'Indulge in ultimate luxury with our ' +
          'presidential suite',
        image_url: '/uploads/banners/banner-3.png',
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
        title: 'Phòng tổng thống',
        description: 
          'Relax and rejuvenate at our world-class spa',
        image_url: '/uploads/banners/banner-4.png',
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
        title: 'Ưu đãi trọn gói dành cho gia đình',
        description: 
          'Perfect getaway for the whole family with ' +
          'special rates',
        image_url: '/uploads/banners/banner-5.png',
        link_url: '/rooms?type=family',
        position: 'home',
        display_order: 5,
        is_active: true,
        start_date: now,
        end_date: futureDate,
        created_at: new Date(),
        updated_at: new Date()
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('banners', null, {});
  }
};
