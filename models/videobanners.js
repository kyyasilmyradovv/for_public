"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Videobanners extends Model {
    static associate({ Products }) {
      this.belongsToMany(Products, {
        through: "Videobannerproducts",
        foreignKey: "videobannerId",
        as: "products",
      });
    }
  }
  Videobanners.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      isAdd: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
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
      description_tm: {
        type: DataTypes.TEXT,
      },
      description_ru: {
        type: DataTypes.TEXT,
      },
      description_en: {
        type: DataTypes.TEXT,
      },
      likes: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
        defaultValue: [],
      },
      preview: {
        type: DataTypes.BOOLEAN,
      },
      image: {
        type: DataTypes.BOOLEAN,
      },
      video: {
        type: DataTypes.BOOLEAN,
      },
      collectionId: {
        type: DataTypes.INTEGER,
      },
      brandId: {
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
      tableName: "videobanners",
      modelName: "Videobanners",
    }
  );
  return Videobanners;
};
