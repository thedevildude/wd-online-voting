"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Question extends Model {
    static associate(models) {
      Question.belongsTo(models.Election, {
        foreignKey: "electionId",
      });
      Question.hasMany(models.Option, {
        foreignKey: "questionId",
      });
    }

    static async createQuestion({ name, description, electionId }) {
      return await this.create({
        name,
        description,
        electionId,
      });
    }

    static async findAllQuestions({ electionId }) {
      return await this.findAll({
        where: {
          electionId,
        },
      });
    }
  }
  Question.init(
    {
      name: DataTypes.STRING,
      description: DataTypes.STRING,
      electionId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Question",
    }
  );
  return Question;
};
