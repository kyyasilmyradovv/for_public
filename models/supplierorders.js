"use strict";
const { generate } = require("./../utils/code_generator");
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Supplierorders extends Model {
    static associate({ Users, Products }) {
      this.belongsTo(Users, {
        foreignKey: "supplierId",
        as: "supplier",
      });
      this.belongsToMany(Products, {
        through: "Soproducts",
        foreignKey: "supplierorderId",
        as: "supplierorder_products",
      });
    }
  }
  Supplierorders.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      code: {
        type: DataTypes.STRING,
        unique: true,
      },
      delivery_time: {
        type: DataTypes.DATE,
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: "pending",
      },
      note: {
        type: DataTypes.TEXT,
      },
      supplierId: {
        type: DataTypes.INTEGER,
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
      tableName: "supplierorders",
      modelName: "Supplierorders",
    }
  );

  Supplierorders.beforeCreate(async (order, options) => {
    order.code = "S" + generate();
  });

  return Supplierorders;
};
