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

    static async findElection({ electionId }) {
      return await this.findByPk(electionId);
    }

    static async closeElection({ electionId }) {
      return await this.update(true, {
        where: {
          id: electionId,
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
      electionStatus: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "Election",
    }
  );
  return Election;
};
