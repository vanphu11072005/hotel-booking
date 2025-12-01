'use strict';

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // Fetch all room_type ids to seed reviews per type
    const [types] = await queryInterface.sequelize.query(
      'SELECT id FROM room_types ORDER BY id ASC'
    );

    if (!types || types.length === 0) {
      throw new Error(
        'No room types found in database. Please run room_types seeders before seeding reviews.'
      );
    }

    // Try to fetch some customer user ids to attribute reviews to real users
    const [users] = await queryInterface.sequelize.query(
      'SELECT id FROM users WHERE role_id = 3 ORDER BY id ASC LIMIT 20'
    );

    const userIds = (users && users.length > 0)
      ? users.map((u) => u.id)
      : [4,5,6];

    const pickUser = (i) => userIds[i % userIds.length];

    const reviews = [];

    // Clear, user-friendly Vietnamese sample comments.
    const sampleComments = [
      'Phòng sạch sẽ, tiện nghi và có vị trí thuận tiện.',
      'Nhân viên thân thiện, dịch vụ tốt. Sẽ quay lại.',
      'Giá cả hợp lý, phòng rộng rãi và thoải mái.',
      'Ăn sáng phong phú, không gian yên tĩnh, rất hài lòng.',
      'Vị trí thuận lợi, di chuyển dễ dàng, phù hợp cho chuyến đi.'
    ];

    // Create exactly 2 approved reviews per room_type using the samples.
    types.forEach((t, ti) => {
      for (let r = 0; r < 2; r++) {
        const idx = (ti * 2 + r) % sampleComments.length;
        const comment = sampleComments[idx];

        reviews.push({
          user_id: pickUser(ti + r),
          room_type_id: t.id,
          rating: Math.floor(Math.random() * 3) + 3, // 3..5
          comment,
          status: 'approved',
          created_at: now,
          updated_at: now,
        });
      }
    });

    await queryInterface.bulkInsert('reviews', reviews);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('reviews', null, {});
  },
};
