"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Orderproducts extends Model {
    static associate() {}
  }
  Orderproducts.init(
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
      productId: {
        type: DataTypes.INTEGER,
      },
      orderId: {
        type: DataTypes.INTEGER,
      },
    },
    {
      sequelize,
      timestamps: false,
      tableName: "orderproducts",
      modelName: "Orderproducts",
    }
  );
  return Orderproducts;
};
