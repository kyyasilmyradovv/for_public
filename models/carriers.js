"use strict";
const bcrypt = require("bcryptjs");
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Carriers extends Model {
    static associate({ Regions, Worders, Orders, Products, Collections }) {
      this.hasMany(Worders, {
        foreignKey: "carrierId",
        as: "carrier_worders",
      });
      this.hasMany(Orders, {
        foreignKey: "carrierId",
        as: "carrier_orders",
      });
      this.belongsToMany(Regions, {
        through: "Carrierregions",
        foreignKey: "carrierId",
        as: "carrier_regions",
      });
      this.belongsToMany(Products, {
        through: "Carrierproducts",
        foreignKey: "carrierId",
        as: "products",
      });
      this.belongsToMany(Collections, {
        through: "Carriercollections",
        foreignKey: "carrierId",
        as: "collections",
      });
    }
  }
  Carriers.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      code: {
        type: DataTypes.STRING,
        unique: true,
      },
      username: {
        type: DataTypes.STRING,
        unique: true,
      },
      name: {
        type: DataTypes.STRING,
      },
      phone: {
        type: DataTypes.STRING,
      },
      email: {
        type: DataTypes.STRING,
      },
      password: {
        type: DataTypes.STRING,
      },
      device_token: {
        type: DataTypes.STRING,
      },
      cash: {
        type: DataTypes.REAL,
        defaultValue: 0,
      },
      tasks_all: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      tasks_today: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      isExpress: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      ownerId: {
        type: DataTypes.INTEGER,
      },
      isBlocked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      tableName: "carriers",
      modelName: "Carriers",
    }
  );

  Carriers.beforeCreate(async (carrier, options) => {
    if (carrier.password)
      carrier.password = await bcrypt.hash(carrier.password, 12);
  });

  return Carriers;
};
