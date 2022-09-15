"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Campaigncollections extends Model {
    static associate() {}
  }
  Campaigncollections.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      collectionId: {
        type: DataTypes.INTEGER,
      },
      campaignId: {
        type: DataTypes.INTEGER,
      },
    },
    {
      sequelize,
      timestamps: false,
      tableName: "campaigncollections",
      modelName: "Campaigncollections",
    }
  );
  return Campaigncollections;
};
