"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Texts extends Model {
    static associate() {}
  }
  Texts.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      key: {
        type: DataTypes.TEXT,
      },
      value: {
        type: DataTypes.TEXT,
      },
      value_ru: {
        type: DataTypes.TEXT,
      },
      value_en: {
        type: DataTypes.TEXT,
      },
    },
    {
      sequelize,
      timestamps: false,
      tableName: "texts",
      modelName: "Texts",
    }
  );

  Texts.beforeSave(async (text, options) => {
    if (text.value)
      text.value = text.value.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
    if (text.value_ru)
      text.value_ru = text.value_ru.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
    if (text.value_en)
      text.value_en = text.value_en.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
  });

  return Texts;
};
