"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    queryInterface.addConstraint("Voters", {
      fields: ["voter_id", "eligible_electionId"],
      type: "unique",
      name: "unique_voter",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("Voters", "unique_voter");
  },
};
