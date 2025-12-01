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
        name: 'Standard Room',
        description:
          'Phòng đơn ấm cúng với các tiện nghi cơ bản, phù hợp cho khách đi một mình',
        base_price: 500000,
        capacity: 1,
        amenities: JSON.stringify(pick(masterAmenities, 4, 6)),
        images: JSON.stringify([
          '/uploads/room_types/1-1.png',
          '/uploads/room_types/1-2.png',
          '/uploads/room_types/1-3.png',
          '/uploads/room_types/1-4.png',
          '/uploads/room_types/1-5.png',
        ]),
        featured: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2,
        name: 'Twin Room',
        description:
          'Phòng đôi thoải mái với tiện nghi hiện đại, phù hợp cho cặp đôi hoặc bạn bè',
        base_price: 800000,
        capacity: 2,
        amenities: JSON.stringify(pick(masterAmenities, 5, 7)),
        images: JSON.stringify([
          '/uploads/room_types/2-1.png',
          '/uploads/room_types/2-2.png',
          '/uploads/room_types/2-3.png',
          '/uploads/room_types/2-4.png',
          '/uploads/room_types/2-5.png',
        ]),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 3,
        name: 'Deluxe Room',
        description:
          'Phòng cao cấp rộng rãi với các tiện nghi cao cấp và tầm nhìn hướng thành phố',
        base_price: 1200000,
        capacity: 2,
        amenities: JSON.stringify(pick(masterAmenities, 6, 9)),
        images: JSON.stringify([
          '/uploads/room_types/3-1.png',
          '/uploads/room_types/3-2.png',
          '/uploads/room_types/3-3.png',
          '/uploads/room_types/3-4.png',
          '/uploads/room_types/3-5.png',
        ]),
        featured: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 4,
        name: 'Family Room',
        description:
          'Phòng gia đình rộng rãi với khu sinh hoạt riêng và nhiều giường, phù hợp cho gia đình',
        base_price: 2000000,
        capacity: 4,
        amenities: JSON.stringify(pick(masterAmenities, 7, 10)),
        images: JSON.stringify([
          '/uploads/room_types/4-1.png',
          '/uploads/room_types/4-2.png',
          '/uploads/room_types/4-3.png',
          '/uploads/room_types/4-4.png',
          '/uploads/room_types/4-5.png',
        ]),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 5,
        name: 'Premium Room',
        description:
          'Phòng hạng sang sang trọng với tầm nhìn toàn cảnh và dịch vụ cao cấp',
        base_price: 5000000,
        capacity: 4,
        amenities: JSON.stringify(pick(masterAmenities, 8, 11)),
        images: JSON.stringify([
          '/uploads/room_types/5-1.png',
          '/uploads/room_types/5-2.png',
          '/uploads/room_types/5-3.png',
          '/uploads/room_types/5-4.png',
          '/uploads/room_types/5-5.png',
        ]),
        featured: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 6,
        name: 'Suite',
        description:
          'Suite rộng rãi với phòng khách riêng, phù hợp cho khách cần không gian làm việc và tiếp khách',
        base_price: 3500000,
        capacity: 3,
        amenities: JSON.stringify(pick(masterAmenities, 7, 10)),
        images: JSON.stringify([
          '/uploads/room_types/6-1.png',
          '/uploads/room_types/6-2.png',
          '/uploads/room_types/6-3.png',
          '/uploads/room_types/6-4.png',
          '/uploads/room_types/6-5.png',
        ]),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 7,
        name: 'Executive Suite',
        description:
          'Executive Suite dành cho khách công tác, có bàn làm việc và tiện nghi cao cấp',
        base_price: 4200000,
        capacity: 3,
        amenities: JSON.stringify(pick(masterAmenities, 8, 11)),
        images: JSON.stringify([
          '/uploads/room_types/7-1.png',
          '/uploads/room_types/7-2.png',
          '/uploads/room_types/7-3.png',
          '/uploads/room_types/7-4.png',
          '/uploads/room_types/7-5.png',
        ]),
        featured: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 8,
        name: 'Presidential Suite',
        description:
          'Phòng tổng thống với nội thất sang trọng và dịch vụ cao cấp',
        base_price: 10000000,
        capacity: 4,
        amenities: JSON.stringify(pick(masterAmenities, 9, 12)),
        images: JSON.stringify([
          '/uploads/room_types/8-1.png',
          '/uploads/room_types/8-2.png',
          '/uploads/room_types/8-3.png',
          '/uploads/room_types/8-4.png',
          '/uploads/room_types/8-5.png',
        ]),
        featured: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 9,
        name: 'Studio',
        description:
          'Studio nhỏ gọn với không gian mở, phù hợp cho lưu trú ngắn ngày',
        base_price: 900000,
        capacity: 2,
        amenities: JSON.stringify(pick(masterAmenities, 5, 7)),
        images: JSON.stringify([
          '/uploads/room_types/9-1.png',
          '/uploads/room_types/9-2.png',
          '/uploads/room_types/9-3.png',
          '/uploads/room_types/9-4.png',
          '/uploads/room_types/9-5.png',
        ]),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 10,
        name: 'Connecting Room',
        description:
          'Phòng kết nối (có cửa nối giữa hai phòng) phù hợp cho gia đình hoặc nhóm',
        base_price: 1800000,
        capacity: 4,
        amenities: JSON.stringify(pick(masterAmenities, 6, 9)),
        images: JSON.stringify([
          '/uploads/room_types/10-1.png',
          '/uploads/room_types/10-2.png',
          '/uploads/room_types/10-3.png',
          '/uploads/room_types/10-4.png',
          '/uploads/room_types/10-5.png',
        ]),
        featured: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 11,
        name: 'Accessible Room',
        description:
          'Phòng tiện nghi cho người khuyết tật (lối đi rộng, phòng tắm thích ứng)',
        base_price: 700000,
        capacity: 2,
        amenities: JSON.stringify(pick(masterAmenities, 5, 7)),
        images: JSON.stringify([
          '/uploads/room_types/11-1.png',
          '/uploads/room_types/11-2.png',
          '/uploads/room_types/11-3.png',
          '/uploads/room_types/11-4.png',
          '/uploads/room_types/11-5.png',
        ]),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 12,
        name: 'Penthouse',
        description:
          'Penthouse cao cấp với tầm nhìn panorama và tiện nghi hạng nhất',
        base_price: 15000000,
        capacity: 6,
        amenities: JSON.stringify(pick(masterAmenities, 10, 12)),
        images: JSON.stringify([
          '/uploads/room_types/12-1.png',
          '/uploads/room_types/12-2.png',
          '/uploads/room_types/12-3.png',
          '/uploads/room_types/12-4.png',
          '/uploads/room_types/12-5.png',
        ]),
        featured: true,
        created_at: new Date(),
        updated_at: new Date(),
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('room_types', null, {});
  }
};
