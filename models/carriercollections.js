"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Carriercollections extends Model {
    static associate() {}
  }
  Carriercollections.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      stock_quantity: {
        type: DataTypes.INTEGER,
      },
      collectionId: {
        type: DataTypes.INTEGER,
      },
      carrierId: {
        type: DataTypes.INTEGER,
      },
    },
    {
      sequelize,
      timestamps: false,
      tableName: "carriercollections",
      modelName: "Carriercollections",
    }
  );
  return Carriercollections;
};
