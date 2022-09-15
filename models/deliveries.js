"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Deliveries extends Model {
    static associate() {}
  }
  Deliveries.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      code: {
        type: DataTypes.STRING,
        unique: true,
      },
      title_tm: {
        type: DataTypes.STRING,
      },
      title_ru: {
        type: DataTypes.STRING,
      },
      title_en: {
        type: DataTypes.STRING,
      },
      type: {
        type: DataTypes.TEXT,
      },
      price: {
        type: DataTypes.REAL,
      },
    },
    {
      sequelize,
      timestamps: false,
      tableName: "deliveries",
      modelName: "Deliveries",
    }
  );
  return Deliveries;
};
