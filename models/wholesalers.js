"use strict";
const bcrypt = require("bcryptjs");
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Wholesalers extends Model {
    static associate({ Worders, Addresses }) {
      this.hasMany(Worders, {
        foreignKey: "wholesalerId",
        as: "wholesaler_orders",
      });
      this.hasMany(Addresses, {
        foreignKey: "wholesalerId",
        as: "addresses",
      });
    }
    toJSON() {
      return {
        ...this.get(),
        password: undefined,
      };
    }
  }
  Wholesalers.init(
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
      isCredited: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
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
      tableName: "wholesalers",
      modelName: "Wholesalers",
    }
  );

  Wholesalers.beforeCreate(async (wholesaler, options) => {
    if (wholesaler.password)
      wholesaler.password = await bcrypt.hash(wholesaler.password, 12);
  });

  return Wholesalers;
};
