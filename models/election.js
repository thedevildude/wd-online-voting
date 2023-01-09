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
      Election.hasMany(models.Voters, {
        foreignKey: "eligible_electionId",
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

    static async findElection({ electionId, adminId }) {
      return await this.findOne({
        where: {
          id: electionId,
          adminId,
        },
      });
    }

    static async deleteElection({ electionId, adminId }) {
      return await this.destroy({
        where: {
          id: electionId,
          adminId: adminId,
        },
      });
    }

    static async closeElection({ electionId, adminId }) {
      return await this.update(
        { electionStatus: true },
        {
          where: {
            id: electionId,
            adminId,
          },
        }
      );
    }

    static async updateName({ electionId, name, adminId }) {
      return await this.update(
        { name },
        {
          where: {
            id: electionId,
            adminId,
          },
        }
      );
    }

    static async startElection({ electionId, adminId }) {
      return await this.update(
        { electionStatus: true },
        {
          where: {
            id: electionId,
            adminId,
          },
        }
      );
    }

    static async endElection({ electionId, adminId }) {
      return await this.update(
        { electionEnded: true },
        {
          where: {
            id: electionId,
            adminId,
          },
        }
      );
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
      electionEnded: {
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
