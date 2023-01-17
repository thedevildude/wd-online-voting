"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Admin extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Admin.hasMany(models.Election, {
        foreignKey: "adminId",
        onDelete: "CASCADE",
      });
    }

    static addAdmin({ firstName, lastName, email, passwordHash }) {
      return this.create({
        firstName,
        lastName,
        email,
        passwordHash,
      });
    }

    static async findAdmin(id) {
      return await this.findByPk(id);
    }

    async updatePassword(newPasswordHash) {
      return await this.update({
        passwordHash: newPasswordHash,
      });
    }

    async updateUser({ firstName, lastName, email }) {
      return await this.update({
        firstName,
        lastName,
        email,
      });
    }
  }
  Admin.init(
    {
      firstName: DataTypes.STRING,
      lastName: DataTypes.STRING,
      email: {
        type: DataTypes.STRING,
        unique: {
          args: true,
          msg: "Email is already registered",
        },
      },
      passwordHash: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Admin",
    }
  );
  return Admin;
};
