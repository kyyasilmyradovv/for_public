"use strict";
const { generate } = require("./../utils/code_generator");
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Worders extends Model {
    static associate({ Carriers, Wholesalers, Products }) {
      this.belongsTo(Wholesalers, {
        foreignKey: "wholesalerId",
        as: "wholesaler",
      });
      this.belongsTo(Carriers, {
        foreignKey: "carrierId",
        as: "carrier",
      });
      this.belongsToMany(Products, {
        through: "Woproducts",
        foreignKey: "worderId",
        as: "worder_products",
      });
    }
  }
  Worders.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      code: {
        type: DataTypes.STRING,
        unique: true,
      },
      payment_type: {
        type: DataTypes.STRING,
      },
      total_price: {
        type: DataTypes.REAL,
      },
      delivery_time: {
        type: DataTypes.STRING,
      },
      address: {
        type: DataTypes.STRING,
      },
      rating: {
        type: DataTypes.REAL,
      },
      comment_by_wholesaler: {
        type: DataTypes.TEXT,
      },
      status: {
        type: DataTypes.STRING,
      },
      actionAt: {
        type: DataTypes.DATE,
      },
      note: {
        type: DataTypes.TEXT,
      },
      carrierId: {
        type: DataTypes.INTEGER,
      },
      wholesalerId: {
        type: DataTypes.INTEGER,
      },
      isSynced: {
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
      tableName: "worders",
      modelName: "Worders",
    }
  );

  Worders.beforeCreate(async (order, options) => {
    order.code = "W" + generate();
  });

  return Worders;
};
