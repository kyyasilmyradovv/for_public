"use strict";
module.exports = {
  up: async (queryInterface, DataTypes) => {
    await queryInterface.createTable("deliveries", {
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
      title_tm: {
        type: DataTypes.STRING,
      },
      title_ru: {
        type: DataTypes.STRING,
      },
      title_en: {
        type: DataTypes.STRING,
      },
      type: {
        type: DataTypes.TEXT,
      },
      price: {
        type: DataTypes.REAL,
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
    await queryInterface.dropTable("deliveries");
  },
};
