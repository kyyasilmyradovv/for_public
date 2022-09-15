"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Cities extends Model {
    static associate({ Regions }) {
      this.hasMany(Regions, {
        foreignKey: "cityId",
        as: "regions",
      });
    }
  }
  Cities.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      name_tm: {
        type: DataTypes.STRING,
      },
      name_ru: {
        type: DataTypes.STRING,
      },
      name_en: {
        type: DataTypes.STRING,
      },
      code: {
        type: DataTypes.STRING,
        unique: true,
      },
    },
    {
      sequelize,
      timestamps: false,
      tableName: "cities",
      modelName: "Cities",
    }
  );
  return Cities;
};
