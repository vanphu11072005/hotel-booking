'use strict';

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('services', [
      // Food & Beverage
      {
        id: 1,
        name: 'Dịch vụ phòng - Bữa sáng',
        description: 'Bữa sáng kiểu lục địa giao tận phòng',
        price: 150000,
        unit: 'phần',
        category: 'Ăn uống',
        status: 'active',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        name: 'Dịch vụ phòng - Bữa trưa',
        description: 'Thực đơn bữa trưa giao tận phòng',
        price: 250000,
        unit: 'phần',
        category: 'Ăn uống',
        status: 'active',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 3,
        name: 'Dịch vụ phòng - Bữa tối',
        description: 'Thực đơn bữa tối giao tận phòng',
        price: 300000,
        unit: 'phần',
        category: 'Ăn uống',
        status: 'active',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      // Laundry
      {
        id: 4,
        name: 'Dịch vụ giặt ủi - Nhanh',
        description: 'Giặt nhanh trong ngày (tính theo kg)',
        price: 100000,
        unit: 'kg',
        category: 'Giặt ủi',
        status: 'active',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 5,
        name: 'Dịch vụ giặt ủi - Thông thường',
        description: 'Giặt ngày hôm sau (tính theo kg)',
        price: 60000,
        unit: 'kg',
        category: 'Giặt ủi',
        status: 'active',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 6,
        name: 'Giặt hấp',
        description: 'Giặt hấp chuyên nghiệp theo đơn',
        price: 80000,
        unit: 'đơn',
        category: 'Giặt ủi',
        status: 'active',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      // Spa & Wellness
      {
        id: 7,
        name: 'Spa - Massage truyền thống',
        description: 'Massage truyền thống 60 phút',
        price: 500000,
        unit: 'lần',
        category: 'Spa & Sức khỏe',
        status: 'active',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      // Transportation
      {
        id: 8,
        name: 'Đón sân bay',
        description: 'Xe riêng từ sân bay đến khách sạn',
        price: 400000,
        unit: 'chuyến',
        category: 'Vận chuyển',
        status: 'active',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 9,
        name: 'Trả khách sân bay',
        description: 'Xe riêng từ khách sạn đến sân bay',
        price: 400000,
        unit: 'chuyến',
        category: 'Vận chuyển',
        status: 'active',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 10,
        name: 'Tham quan thành phố - Nửa ngày',
        description: 'Tour nửa ngày có hướng dẫn viên',
        price: 800000,
        unit: 'lần',
        category: 'Vận chuyển',
        status: 'active',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 11,
        name: 'Trả phòng muộn',
        description: 'Trả phòng muộn đến 18:00',
        price: 500000,
        unit: 'lần',
        category: 'Tiện ích phòng',
        status: 'active',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 12,
        name: 'Nhận phòng sớm',
        description: 'Nhận phòng sớm từ 06:00',
        price: 500000,
        unit: 'lần',
        category: 'Tiện ích phòng',
        status: 'active',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('services', null, {});
  }
};
