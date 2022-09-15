"use strict";
module.exports = {
  up: async (queryInterface, DataTypes) => {
    await queryInterface.createTable("videobanners", {
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
    });
  },
  down: async (queryInterface, DataTypes) => {
    await queryInterface.dropTable("videobanners");
  },
};
