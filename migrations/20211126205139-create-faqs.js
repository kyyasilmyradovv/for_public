"use strict";
module.exports = {
  up: async (queryInterface, DataTypes) => {
    await queryInterface.createTable("faqs", {
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
      title_tm: {
        type: DataTypes.TEXT,
      },
      title_ru: {
        type: DataTypes.TEXT,
      },
      title_en: {
        type: DataTypes.TEXT,
      },
      text_tm: {
        type: DataTypes.TEXT,
      },
      text_ru: {
        type: DataTypes.TEXT,
      },
      text_en: {
        type: DataTypes.TEXT,
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
    await queryInterface.dropTable("faqs");
  },
};
