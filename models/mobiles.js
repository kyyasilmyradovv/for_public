"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Mobiles extends Model {
    static associate() {}
  }
  Mobiles.init(
    {
      name: DataTypes.STRING,
      device_token: DataTypes.TEXT,
    },
    {
      sequelize,
      timestamps: false,
      tableName: "mobiles",
      modelName: "Mobiles",
    }
  );
  return Mobiles;
};
