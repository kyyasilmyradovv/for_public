"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Deliverytimes extends Model {
    static associate() {}
  }
  Deliverytimes.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      starts: {
        type: DataTypes.INTEGER,
      },
      ends: {
        type: DataTypes.INTEGER,
      },
      ownerId: {
        type: DataTypes.INTEGER,
      },
    },
    {
      sequelize,
      timestamps: false,
      tableName: "deliverytimes",
      modelName: "Deliverytimes",
    }
  );
  return Deliverytimes;
};
