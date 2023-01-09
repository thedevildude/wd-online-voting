"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Option extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Option.belongsTo(models.Question, {
        foreignKey: "questionId",
        onDelete: "CASCADE",
      });
    }

    static async createOption({ name, questionId }) {
      return await this.create({
        option_name: name,
        votes: 0,
        questionId,
      });
    }

    static async findAllOptions({ questionId }) {
      return await this.findAll({
        where: {
          questionId,
        },
      });
    }

    static async deleteOption({ optionId, questionId }) {
      return await this.destroy({
        where: {
          id: optionId,
          questionId,
        },
      });
    }

    static async incrementVote({ questionId, optionId }) {
      return await this.increment("votes", {
        where: {
          questionId,
          id: optionId,
        },
      });
    }
  }
  Option.init(
    {
      option_name: {
        type: DataTypes.STRING,
        validate: {
          len: {
            args: [1, 15],
            msg: "Option must be less than 15 characters",
          },
        },
      },
      votes: DataTypes.INTEGER,
      questionId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Option",
    }
  );
  return Option;
};
