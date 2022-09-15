"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Collectionproducts extends Model {
    static associate({ Collections }) {
      this.belongsTo(Collections, {
        foreignKey: "collectionId",
        as: "collection",
      });
    }
  }
  Collectionproducts.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      quantity: {
        type: DataTypes.INTEGER,
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
      tableName: "collectionproducts",
      modelName: "Collectionproducts",
    }
  );
  return Collectionproducts;
};
