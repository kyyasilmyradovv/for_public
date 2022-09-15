"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Collectioncategories extends Model {
    static associate() {}
  }
  Collectioncategories.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      categoryId: DataTypes.INTEGER,
      collectionId: DataTypes.INTEGER,
    },
    {
      sequelize,
      timestamps: false,
      tableName: "collectioncategories",
      modelName: "Collectioncategories",
    }
  );
  return Collectioncategories;
};
