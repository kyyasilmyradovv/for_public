"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Categoriesandbrands extends Model {
    static associate() {}
  }
  Categoriesandbrands.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      categoryId: {
        type: DataTypes.INTEGER,
      },
      brandId: {
        type: DataTypes.INTEGER,
      },
    },
    {
      sequelize,
      timestamps: false,
      tableName: "categoriesandbrands",
      modelName: "Categoriesandbrands",
    }
  );
  return Categoriesandbrands;
};
