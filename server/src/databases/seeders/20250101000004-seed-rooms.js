'use strict';

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const rooms = [];
    const baseTime = new Date();
    baseTime.setDate(baseTime.getDate() - 30);
    let idx = 0;

    // price mapping to match seeded room_types
    const priceMap = {
      1: 500000,
      2: 800000,
      3: 1200000,
      4: 2000000,
      5: 5000000,
      6: 3500000,
      7: 4200000,
      8: 10000000,
      9: 900000,
      10: 1800000,
      11: 700000,
      12: 15000000,
    };

    // Create exactly 3 rooms per room_type (ids 1..12)
    for (let typeId = 1; typeId <= 12; typeId++) {
      for (let n = 1; n <= 3; n++) {
        const createdAt = new Date(baseTime);
        createdAt.setDate(createdAt.getDate() + idx);

        rooms.push({
          room_type_id: typeId,
          // room numbers start at 101 and increment per room
          room_number: `${101 + idx}`,
          // simple floor assignment: two types per floor
          floor: Math.ceil(typeId / 2),
          status: 'available',
          price: priceMap[typeId] || 100000,
          description: `Sample room ${n} of room type ${typeId}`,
          created_at: createdAt,
          updated_at: createdAt,
        });

        idx++;
      }
    }

    // All seeded rooms remain 'available' by default for predictable tests

    await queryInterface.bulkInsert('rooms', rooms);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('rooms', null, {});
  }
};
