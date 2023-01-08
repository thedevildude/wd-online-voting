"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Voters extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Voters.belongsTo(models.Election, {
        foreignKey: "eligible_electionId",
        onDelete: "CASCADE",
      });
    }

    static async addVoter({ voter_id, passwordHash, electionId }) {
      return await this.create({
        voter_id,
        passwordHash,
        eligible_electionId: electionId,
      });
    }

    static async findAllVoters({ electionId }) {
      return await this.findAll({
        where: {
          eligible_electionId: electionId,
        },
      });
    }

    static async deleteVoter({ voter_id, electionId }) {
      return await this.destroy({
        where: {
          voter_id,
          eligible_electionId: electionId,
        },
      });
    }
  }
  Voters.init(
    {
      voter_id: DataTypes.STRING,
      passwordHash: DataTypes.STRING,
      eligible_electionId: DataTypes.INTEGER,
      vote_casted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      type: {
        type: DataTypes.STRING,
        defaultValue: "voter",
      },
    },
    {
      sequelize,
      modelName: "Voters",
    }
  );
  return Voters;
};
