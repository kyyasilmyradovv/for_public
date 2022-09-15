"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Banners extends Model {
    static associate() {}
  }
  Banners.init(
    {
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
      child_categoryIds: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
      },
      child_brandId: {
        type: DataTypes.INTEGER,
      },
      type: {
        type: DataTypes.STRING,
        defaultValue: "both",
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
    },
    {
      sequelize,
      tableName: "banners",
      modelName: "Banners",
    }
  );
  return Banners;
};
