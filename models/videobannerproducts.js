"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Videobannerproducts extends Model {
    static associate() {}
  }
  Videobannerproducts.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      productId: {
        type: DataTypes.INTEGER,
      },
      videobannerId: {
        type: DataTypes.INTEGER,
      },
    },
    {
      sequelize,
      timestamps: false,
      tableName: "videobannerproducts",
      modelName: "Videobannerproducts",
    }
  );
  return Videobannerproducts;
};
