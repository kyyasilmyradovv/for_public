"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Products extends Model {
    static associate({
      Categories,
      Brands,
      Users,
      Productimages,
      Collections,
      Supplierorders,
      Worders,
      Orders,
      Discounts,
      Campaigns,
      Videobanners,
      Carriers,
    }) {
      this.belongsToMany(Categories, {
        through: "Productcategories",
        foreignKey: "productId",
        as: "categories",
      });
      this.belongsTo(Brands, {
        foreignKey: "brandId",
        as: "brand",
      });
      this.belongsTo(Users, {
        foreignKey: "supplierId",
        as: "supplier",
      });
      this.belongsToMany(Collections, {
        through: "Collectionproducts",
        foreignKey: "productId",
        as: "collection",
      });
      this.belongsToMany(Carriers, {
        through: "Carrierproducts",
        foreignKey: "productId",
        as: "carrier",
      });
      this.belongsToMany(Supplierorders, {
        through: "Soproducts",
        foreignKey: "productId",
        as: "supplierorder",
      });
      this.belongsToMany(Worders, {
        through: "Woproducts",
        foreignKey: "productId",
        as: "worder",
      });
      this.belongsToMany(Orders, {
        through: "Orderproducts",
        foreignKey: "productId",
        as: "order",
      });
      this.belongsToMany(Campaigns, {
        through: "Campaignproducts",
        foreignKey: "productId",
        as: "campaign",
      });
      this.belongsToMany(Videobanners, {
        through: "Videobannerproducts",
        foreignKey: "productId",
        as: "videobanner",
      });
      this.hasMany(Productimages, {
        foreignKey: "productId",
        as: "product_images",
        onDelete: "CASCADE",
        hooks: true,
      });
      this.hasOne(Discounts, {
        foreignKey: "productId",
        as: "discount",
        onDelete: "CASCADE",
        hooks: true,
      });
    }
  }
  Products.init(
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
      isBulk: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      price_bulk: {
        type: DataTypes.REAL,
      },
      bulk_min: {
        type: DataTypes.INTEGER,
      },
      type: {
        type: DataTypes.STRING,
        defaultValue: "both",
      },
      express_max: {
        type: DataTypes.INTEGER,
      },
      weight: {
        type: DataTypes.STRING,
      },
      volume: {
        type: DataTypes.STRING,
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
      canPublished: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      brandId: {
        type: DataTypes.INTEGER,
      },
      supplierId: {
        type: DataTypes.INTEGER,
      },
      ownerId: {
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
      tableName: "products",
      modelName: "Products",
    }
  );

  Products.beforeSave(async (product, options) => {
    product.unordered =
      product.stock_quantity - product.ordered - product.in_carrier_stock;
    product.isEnoughInStock = product.unordered > product.stock_min;
  });

  return Products;
};
