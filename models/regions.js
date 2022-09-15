"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Regions extends Model {
    static associate({ Carriers, Cities, Addresses }) {
      this.belongsToMany(Carriers, {
        through: "Carrierregions",
        foreignKey: "regionId",
        as: "carriers",
      });
      this.belongsTo(Cities, {
        foreignKey: "cityId",
        as: "city",
      });
      this.hasMany(Addresses, {
        foreignKey: "regionId",
        as: "addresses",
      });
    }
  }
  Regions.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      name_tm: {
        type: DataTypes.TEXT,
      },
      name_ru: {
        type: DataTypes.TEXT,
      },
      name_en: {
        type: DataTypes.TEXT,
      },
      isExpress: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      express_time: {
        type: DataTypes.INTEGER,
      },
      cityId: {
        type: DataTypes.INTEGER,
      },
    },
    {
      sequelize,
      timestamps: false,
      tableName: "regions",
      modelName: "Regions",
    }
  );
  return Regions;
};
