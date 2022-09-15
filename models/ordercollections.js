"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Ordercollections extends Model {
    static associate() {}
  }
  Ordercollections.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      price: {
        type: DataTypes.REAL,
      },
      total_price: {
        type: DataTypes.REAL,
      },
      discount_type: {
        type: DataTypes.STRING,
      },
      discount_amount: {
        type: DataTypes.REAL,
      },
      discount_required: {
        type: DataTypes.INTEGER,
      },
      discount_bonus: {
        type: DataTypes.INTEGER,
      },
      quantity: {
        type: DataTypes.INTEGER,
      },
      collectionId: {
        type: DataTypes.INTEGER,
      },
      orderId: {
        type: DataTypes.INTEGER,
      },
    },
    {
      sequelize,
      timestamps: false,
      tableName: "ordercollections",
      modelName: "Ordercollections",
    }
  );
  return Ordercollections;
};
