"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("banners", {
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
      slider_image_tm: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      slider_image_ru: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      slider_image_en: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      m_slider_image_tm: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      m_slider_image_ru: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      m_slider_image_en: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      large_image_tm: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      large_image_ru: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      large_image_en: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      medium_image_tm: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      medium_image_ru: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      medium_image_en: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      url: {
        type: DataTypes.STRING,
      },
      child_type: {
        type: DataTypes.STRING,
      },
      childId: {
        type: DataTypes.STRING,
      },
      type: {
        type: DataTypes.STRING,
        defaultValue: "both",
      },
      child_categoryIds: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
      },
      child_brandId: {
        type: DataTypes.INTEGER,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
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
    await queryInterface.dropTable("banners");
  },
};
