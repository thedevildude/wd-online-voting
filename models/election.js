"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Election extends Model {
    static associate(models) {
      Election.belongsTo(models.Admin, {
        foreignKey: "adminId",
      });
      Election.hasMany(models.Question, {
        foreignKey: "electionId",
      });
    }

    static addElection({ name, adminId }) {
      return this.create({
        name,
        adminId,
        electionStatus: false,
      });
    }

    static async findAllElections({ adminId }) {
      return await this.findAll({
        where: {
          adminId,
        },
      });
    }
  }
  Election.init(
    {
      name: {
        type: DataTypes.STRING,
        validate: {
          len: {
            args: 3,
            msg: "Election name should be atleast 3 characters long",
          },
        },
      },
      adminId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Election",
    }
  );
  return Election;
};
