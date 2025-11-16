'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Populate room amenities from the room_types table where available
    // This uses a JOIN update; works on MySQL/MariaDB. If using Postgres,
    // replace with appropriate UPDATE ... FROM syntax.
    const dialect = queryInterface.sequelize.getDialect();

    if (dialect === 'mysql' || dialect === 'mariadb') {
      await queryInterface.sequelize.query(
        `UPDATE rooms r
         JOIN room_types rt ON r.room_type_id = rt.id
         SET r.amenities = rt.amenities
         WHERE rt.amenities IS NOT NULL`
      );
    } else if (dialect === 'postgres') {
      await queryInterface.sequelize.query(
        `UPDATE rooms
         SET amenities = rt.amenities
         FROM room_types rt
         WHERE rooms.room_type_id = rt.id
           AND rt.amenities IS NOT NULL`
      );
    } else {
      // Generic fallback: fetch rows and update individually
      const [roomTypes] = await queryInterface.sequelize.query(
        `SELECT id, amenities FROM room_types WHERE amenities IS NOT NULL`
      );

      for (const rt of roomTypes) {
        await queryInterface.bulkUpdate(
          'rooms',
          { amenities: rt.amenities },
          { room_type_id: rt.id }
        );
      }
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkUpdate('rooms', { amenities: null }, {});
  },
};
