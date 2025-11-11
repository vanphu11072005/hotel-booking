"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("rooms", "featured", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });
    // add index to optimize featured queries
    await queryInterface.addIndex("rooms", ["featured"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex("rooms", ["featured"]).catch(() => {});
    await queryInterface.removeColumn("rooms", "featured");
  }
};
