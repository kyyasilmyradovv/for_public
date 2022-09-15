"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Soproducts extends Model {
    static associate() {}
  }
  Soproducts.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      quantity: {
        type: DataTypes.INTEGER,
      },
      supplied_quantity: {
        type: DataTypes.INTEGER,
      },
      productId: {
        type: DataTypes.INTEGER,
      },
      supplierorderId: {
        type: DataTypes.INTEGER,
      },
    },
    {
      sequelize,
      timestamps: false,
      tableName: "soproducts",
      modelName: "Soproducts",
    }
  );
  return Soproducts;
};
