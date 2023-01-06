"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Question extends Model {
    static associate(models) {
      Question.belongsTo(models.Election, {
        foreignKey: "electionId",
        onDelete: "CASCADE",
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

    static async findQuestion({ electionId, questionId }) {
      return await this.findOne({
        where: {
          electionId,
          id: questionId,
        },
      });
    }

    static async updateName({ electionId, name, questionId }) {
      return await this.update(
        { name },
        {
          where: {
            id: questionId,
            electionId,
          },
        }
      );
    }

    static async updateDescription({ electionId, description, questionId }) {
      return await this.update(
        { description },
        {
          where: {
            id: questionId,
            electionId,
          },
        }
      );
    }

    static async deleteQuestion({ electionId, questionId }) {
      return await this.destroy({
        where: {
          electionId,
          id: questionId,
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
