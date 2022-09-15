"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Categories extends Model {
    static associate({ Brands, Products, Collections }) {
      this.belongsToMany(Brands, {
        through: "Categoriesandbrands",
        foreignKey: "categoryId",
        as: "category_brands",
      });
      this.belongsToMany(Products, {
        through: "Productcategories",
        foreignKey: "categoryId",
        as: "products",
      });
      this.belongsToMany(Collections, {
        through: "Collectioncategories",
        foreignKey: "categoryId",
        as: "collections",
      });
      this.hasMany(Categories, {
        foreignKey: "parentId",
        as: "category_childs",
      });
      this.belongsTo(Categories, {
        foreignKey: "parentId",
        as: "category_parent",
      });
    }
  }
  Categories.init(
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
      priority: {
        type: DataTypes.INTEGER,
        defaultValue: 10,
      },
      isLeaf: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      parentId: {
        type: DataTypes.INTEGER,
      },
      image_isAdded: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      type: {
        type: DataTypes.STRING,
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
      tableName: "categories",
      modelName: "Categories",
    }
  );

  return Categories;
};
