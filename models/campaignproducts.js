"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Campaignproducts extends Model {
    static associate() {}
  }
  Campaignproducts.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      productId: {
        type: DataTypes.INTEGER,
      },
      campaignId: {
        type: DataTypes.INTEGER,
      },
    },
    {
      sequelize,
      timestamps: false,
      tableName: "campaignproducts",
      modelName: "Campaignproducts",
    }
  );
  return Campaignproducts;
};
