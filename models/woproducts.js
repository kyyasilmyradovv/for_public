"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Woproducts extends Model {
    static associate({ Worders }) {
      this.belongsTo(Worders, {
        foreignKey: "worderId",
        as: "order",
      });
    }
  }
  Woproducts.init(
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
      quantity: {
        type: DataTypes.INTEGER,
      },
      productId: {
        type: DataTypes.INTEGER,
      },
      worderId: {
        type: DataTypes.INTEGER,
      },
    },
    {
      sequelize,
      timestamps: false,
      tableName: "woproducts",
      modelName: "Woproducts",
    }
  );
  return Woproducts;
};
