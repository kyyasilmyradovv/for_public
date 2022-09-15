"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Carrierregions extends Model {
    static associate() {}
  }
  Carrierregions.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      regionId: {
        type: DataTypes.INTEGER,
      },
      carrierId: {
        type: DataTypes.INTEGER,
      },
    },
    {
      sequelize,
      timestamps: false,
      tableName: "carrierregions",
      modelName: "Carrierregions",
    }
  );
  return Carrierregions;
};
