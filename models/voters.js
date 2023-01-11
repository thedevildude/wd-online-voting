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

    static async findVoter(id) {
      return await this.findByPk(id);
    }

    static async deleteVoter({ voter_id, electionId }) {
      return await this.destroy({
        where: {
          voter_id,
          eligible_electionId: electionId,
        },
      });
    }

    static async updateVoteCasted({ id }) {
      return await this.update(
        { vote_casted: true },
        {
          where: {
            id,
          },
        }
      );
    }

    static async addVoterResponse(voterResponse, id) {
      return await this.update(
        { voterResponse },
        {
          where: {
            id,
          },
        }
      );
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
      voterResponse: {
        type: DataTypes.JSONB,
      },
    },
    {
      sequelize,
      modelName: "Voters",
    }
  );
  return Voters;
};
