"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Voters", "voterResponse", {
      type: Sequelize.JSONB,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Voters", "voterResponse");
  },
};
