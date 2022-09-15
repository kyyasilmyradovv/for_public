"use strict";
module.exports = {
  up: async (queryInterface, DataTypes) => {
    await queryInterface.createTable("products", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
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
      given_price: {
        type: DataTypes.REAL,
      },
      price: {
        type: DataTypes.REAL,
      },
      price_express: {
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
    });
  },
  down: async (queryInterface, DataTypes) => {
    await queryInterface.dropTable("products");
  },
};
