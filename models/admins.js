"use strict";
const bcrypt = require("bcryptjs");
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Admins extends Model {
    static associate() { }
    toJSON() {
      return {
        ...this.get(),
        password: undefined,
      };
    }
  }
  Admins.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      username: {
        type: DataTypes.STRING,
        unique: true,
      },
      name: {
        type: DataTypes.STRING,
      },
      phone: {
        type: DataTypes.STRING,
      },
      email: {
        type: DataTypes.STRING,
      },
      password: {
        type: DataTypes.STRING,
      },
      role: {
        type: DataTypes.STRING,
      },
      device_token: {
        type: DataTypes.STRING,
      },
      isBlocked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      timestamps: false,
      tableName: "admins",
      modelName: "Admins",
    }
  );

  Admins.beforeCreate(async (admin, options) => {
    if (admin.password) admin.password = await bcrypt.hash(admin.password, 12);
  });

  return Admins;
};
