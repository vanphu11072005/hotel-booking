'use strict';

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // master amenities pool
    const masterAmenities = [
      'Giường King',
      'Giường đôi',
      'Điều hòa',
      'Wi‑Fi',
      'TV thông minh',
      'Phòng tắm riêng',
      'Tủ lạnh mini',
      'Bàn làm việc',
      'Két an toàn',
      'Ban công',
      'Máy pha cà phê',
      'Bồn tắm',
    ];

    const pick = (pool, min, max) => {
      const count = Math.floor(Math.random() * (max - min + 1)) + min;
      const copy = [...pool];
      const out = [];
      for (let i = 0; i < count && copy.length; i++) {
        const idx = Math.floor(Math.random() * copy.length);
        out.push(copy.splice(idx, 1)[0]);
      }
      return out;
    };

    await queryInterface.bulkInsert('room_types', [
      {
        id: 1,
        name: 'Phòng Tiêu chuẩn',
        description:
          'Phòng đơn ấm cúng với các tiện nghi cơ bản, phù hợp cho khách đi một mình',
        base_price: 500000,
        capacity: 1,
        amenities: JSON.stringify(pick(masterAmenities, 4, 6)),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2,
        name: 'Phòng 2 giường đơn',
        description:
          'Phòng đôi thoải mái với tiện nghi hiện đại, phù hợp cho cặp đôi hoặc bạn bè',
        base_price: 800000,
        capacity: 2,
        amenities: JSON.stringify(pick(masterAmenities, 5, 7)),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 3,
        name: 'Phòng Cao cấp',
        description:
          'Phòng cao cấp rộng rãi với các tiện nghi cao cấp và tầm nhìn hướng thành phố',
        base_price: 1200000,
        capacity: 2,
        amenities: JSON.stringify(pick(masterAmenities, 6, 9)),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 4,
        name: 'Phòng Gia đình',
        description:
          'Phòng gia đình rộng rãi với khu sinh hoạt riêng và nhiều giường, phù hợp cho gia đình',
        base_price: 2000000,
        capacity: 4,
        amenities: JSON.stringify(pick(masterAmenities, 7, 10)),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 5,
        name: 'Phòng Hạng sang',
        description:
          'Phòng hạng sang sang trọng với tầm nhìn toàn cảnh và dịch vụ cao cấp',
        base_price: 5000000,
        capacity: 4,
        amenities: JSON.stringify(pick(masterAmenities, 8, 11)),
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('room_types', null, {});
  }
};
