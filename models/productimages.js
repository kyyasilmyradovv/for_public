"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Productimages extends Model {
    static associate({ Products, Collections }) {
      this.belongsTo(Products, {
        foreignKey: "productId",
        as: "product",
      });
      this.belongsTo(Collections, {
        foreignKey: "collectionId",
        as: "collection",
      });
    }
  }
  Productimages.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      productId: {
        type: DataTypes.INTEGER,
      },
      collectionId: {
        type: DataTypes.INTEGER,
      },
    },
    {
      sequelize,
      timestamps: false,
      tableName: "productimages",
      modelName: "Productimages",
    }
  );
  return Productimages;
};
