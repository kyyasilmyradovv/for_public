"use strict";
const bcrypt = require("bcryptjs");
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    static associate({ Addresses, Orders, Products, Supplierorders }) {
      this.hasMany(Addresses, {
        foreignKey: "userId",
        as: "addresses",
      });
      this.hasMany(Orders, {
        foreignKey: "userId",
        as: "user_orders",
      });
      this.hasMany(Supplierorders, {
        foreignKey: "supplierId",
        as: "supplier_orders",
      });
      this.hasMany(Products, {
        foreignKey: "supplierId",
        as: "supplier_products",
      });
    }
    toJSON() {
      return {
        ...this.get(),
        sms_code: undefined,
        password: undefined,
      };
    }
  }
  Users.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      code: {
        type: DataTypes.STRING,
        unique: true,
      },
      name: {
        type: DataTypes.STRING,
      },
      phone: {
        type: DataTypes.STRING,
        unique: true,
      },
      email: {
        type: DataTypes.STRING,
      },
      sms_code: {
        type: DataTypes.STRING,
      },
      password: {
        type: DataTypes.STRING,
      },
      promos: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
        defaultValue: [],
      },
      orders_delivered: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      orders_rejected: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      device_token: {
        type: DataTypes.STRING,
      },
      isBlocked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      company_name: {
        type: DataTypes.STRING,
      },
      isSupplier: {
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
      tableName: "users",
      modelName: "Users",
    }
  );

  Users.beforeCreate(async (user, options) => {
    if (user.password) user.password = await bcrypt.hash(user.password, 12);
  });

  return Users;
};
