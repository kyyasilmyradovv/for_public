"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Collections extends Model {
    static associate({
      Brands,
      Products,
      Productimages,
      Campaigns,
      Discounts,
      Orders,
      Carriers,
      Categories,
    }) {
      this.belongsToMany(Products, {
        through: "Collectionproducts",
        foreignKey: "collectionId",
        as: "collection_products",
      });
      this.belongsToMany(Categories, {
        through: "Collectioncategories",
        foreignKey: "collectionId",
        as: "categories",
      });
      this.belongsToMany(Campaigns, {
        through: "Campaigncollections",
        foreignKey: "collectionId",
        as: "campaigns",
      });
      this.belongsToMany(Orders, {
        through: "Ordercollections",
        foreignKey: "collectionId",
        as: "order",
      });
      this.belongsToMany(Carriers, {
        through: "Carriercollections",
        foreignKey: "collectionId",
        as: "carrier",
      });
      this.hasOne(Discounts, {
        foreignKey: "collectionId",
        as: "discount",
        onDelete: "CASCADE",
        hooks: true,
      });
      this.hasMany(Productimages, {
        foreignKey: "collectionId",
        as: "images",
        onDelete: "CASCADE",
        hooks: true,
      });
      this.belongsTo(Brands, {
        foreignKey: "brandId",
        as: "brand",
      });
    }
  }
  Collections.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      code: {
        type: DataTypes.STRING,
        unique: true,
      },
      bar_code: {
        type: DataTypes.STRING,
        unique: true,
      },
      shelf_code: {
        type: DataTypes.STRING,
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
      description_tm: {
        type: DataTypes.TEXT,
      },
      description_ru: {
        type: DataTypes.TEXT,
      },
      description_en: {
        type: DataTypes.TEXT,
      },
      price: {
        type: DataTypes.REAL,
      },
      price_express: {
        type: DataTypes.REAL,
      },
      given_price: {
        type: DataTypes.REAL,
      },
      type: {
        type: DataTypes.STRING,
        defaultValue: "both",
      },
      express_max: {
        type: DataTypes.INTEGER,
      },
      stock_quantity: {
        type: DataTypes.INTEGER,
      },
      stock_min: {
        type: DataTypes.INTEGER,
      },
      ordered: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      in_carrier_stock: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      unordered: {
        type: DataTypes.INTEGER,
      },
      isEnoughInStock: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      likes: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
        defaultValue: [],
      },
      from: {
        type: DataTypes.DATE,
      },
      to: {
        type: DataTypes.DATE,
      },
      brandId: {
        type: DataTypes.INTEGER,
      },
      canPublished: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isNew: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isHit: {
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
      tableName: "collections",
      modelName: "Collections",
    }
  );

  Collections.beforeSave(async (col, options) => {
    col.unordered = col.stock_quantity - col.ordered - col.in_carrier_stock;
    col.isEnoughInStock = col.unordered > col.stock_min;
  });

  return Collections;
};
