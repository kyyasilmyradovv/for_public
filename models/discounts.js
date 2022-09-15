"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Discounts extends Model {
    static associate({ Collections, Products, Campaigns }) {
      this.belongsTo(Collections, {
        foreignKey: "collectionId",
        as: "collection",
      });
      this.belongsTo(Products, {
        foreignKey: "productId",
        as: "product",
      });
      this.belongsTo(Campaigns, {
        foreignKey: "campaignId",
        as: "campaign",
      });
    }
  }
  Discounts.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      type: {
        type: DataTypes.STRING,
      },
      amount: {
        type: DataTypes.REAL,
      },
      required: {
        type: DataTypes.INTEGER,
      },
      bonus: {
        type: DataTypes.INTEGER,
      },
      from: {
        type: DataTypes.DATE,
      },
      to: {
        type: DataTypes.DATE,
      },
      dep_type: {
        type: DataTypes.STRING,
        defaultValue: "both",
      },
      collectionId: {
        type: DataTypes.INTEGER,
      },
      productId: {
        type: DataTypes.INTEGER,
      },
      campaignId: {
        type: DataTypes.INTEGER,
      },
      isActive: {
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
      tableName: "discounts",
      modelName: "Discounts",
    }
  );
  return Discounts;
};
