"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Election extends Model {
    static associate(models) {
      Election.belongsTo(models.Admin, {
        foreignKey: "adminId",
      });
    }

    static addElection({ name, adminId }) {
      return this.create({
        name,
        adminId,
        electionStatus: false,
      });
    }
  }
  Election.init(
    {
      name: DataTypes.STRING,
      adminId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Election",
    }
  );
  return Election;
};
