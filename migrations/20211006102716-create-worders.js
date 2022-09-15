"use strict";
module.exports = {
  up: async (queryInterface, DataTypes) => {
    await queryInterface.createTable("worders", {
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
    });
  },
  down: async (queryInterface, DataTypes) => {
    await queryInterface.dropTable("worders");
  },
};
