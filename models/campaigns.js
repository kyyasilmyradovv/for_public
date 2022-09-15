"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Campaigns extends Model {
    static associate({ Products, Collections, Discounts }) {
      this.belongsToMany(Products, {
        through: "Campaignproducts",
        foreignKey: "campaignId",
        as: "products",
      });
      this.belongsToMany(Collections, {
        through: "Campaigncollections",
        foreignKey: "campaignId",
        as: "collections",
      });
      this.hasOne(Discounts, {
        foreignKey: "campaignId",
        as: "discount",
        onDelete: "CASCADE",
        hooks: true,
      });
    }
  }
  Campaigns.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
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
      description_tm: {
        type: DataTypes.TEXT,
      },
      description_ru: {
        type: DataTypes.TEXT,
      },
      description_en: {
        type: DataTypes.TEXT,
      },
      image_isAdded: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      brandId: {
        type: DataTypes.INTEGER,
      },
      categoryId: {
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
      tableName: "campaigns",
      modelName: "Campaigns",
    }
  );
  return Campaigns;
};
