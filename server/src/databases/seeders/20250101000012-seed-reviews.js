'use strict';

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // Fetch some existing room ids to avoid FK constraint errors.
    const [rooms] = await queryInterface.sequelize.query(
      'SELECT id FROM rooms ORDER BY id ASC LIMIT 20'
    );

    if (!rooms || rooms.length === 0) {
      throw new Error(
        'No rooms found in database. Please run rooms seeders before seeding reviews.'
      );
    }

    // simple helper to pick a room id by index
    const roomId = (idx) => rooms[idx % rooms.length].id;

    const reviews = [
      {
        user_id: 4,
        room_id: roomId(0),
        rating: 5,
        comment: 'Phòng sạch, nhân viên thân thiện. Trải nghiệm rất tốt!',
        status: 'approved',
        created_at: now,
        updated_at: now,
      },
      {
        user_id: 5,
        room_id: roomId(1),
        rating: 4,
        comment: 'Vị trí thuận tiện, phòng nhỏ nhưng ấm cúng.',
        status: 'approved',
        created_at: now,
        updated_at: now,
      },
      {
        user_id: 6,
        room_id: roomId(2),
        rating: 5,
        comment: 'View đẹp, đồ ăn sáng ngon. Sẽ quay lại.',
        status: 'approved',
        created_at: now,
        updated_at: now,
      },
      {
        user_id: 4,
        room_id: roomId(3),
        rating: 3,
        comment:
          'Phòng hơi ồn do gần thang máy, nhưng bù lại tiện nghi đầy đủ.',
        status: 'approved',
        created_at: now,
        updated_at: now,
      },
      {
        user_id: 5,
        room_id: roomId(4),
        rating: 4,
        comment: 'Dịch vụ tốt, giá cả hợp lý.',
        status: 'approved',
        created_at: now,
        updated_at: now,
      },
      {
        user_id: 6,
        room_id: roomId(5),
        rating: 5,
        comment: 'Suite rất rộng rãi, phù hợp gia đình.',
        status: 'approved',
        created_at: now,
        updated_at: now,
      },
      {
        user_id: 4,
        room_id: roomId(6),
        rating: 2,
        comment: 'Một vài thiết bị cũ, cần bảo trì.',
        status: 'approved',
        created_at: now,
        updated_at: now,
      },
      {
        user_id: 5,
        room_id: roomId(7),
        rating: 4,
        comment: 'Nhân viên lễ tân hỗ trợ nhiệt tình, check-in nhanh.',
        status: 'approved',
        created_at: now,
        updated_at: now,
      },
    ];

    await queryInterface.bulkInsert('reviews', reviews);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('reviews', null, {});
  },
};
