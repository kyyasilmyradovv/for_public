"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Brands extends Model {
    static associate({ Categories, Products, Collections }) {
      this.belongsToMany(Categories, {
        through: "Categoriesandbrands",
        foreignKey: "brandId",
        as: "brand_categories",
      });
      this.hasMany(Products, {
        foreignKey: "brandId",
        as: "brand_products",
      });
      this.hasMany(Collections, {
        foreignKey: "brandId",
        as: "collections",
      });
    }
  }
  Brands.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      code: {
        type: DataTypes.STRING,
        unique: true,
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
      image_isAdded: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      canPublished: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
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
      tableName: "brands",
      modelName: "Brands",
    }
  );
  return Brands;
};
