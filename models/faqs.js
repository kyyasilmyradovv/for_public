"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Faqs extends Model {
    static associate() {}
  }
  Faqs.init(
    {
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
    },
    {
      sequelize,
      tableName: "faqs",
      modelName: "Faqs",
    }
  );
  return Faqs;
};
