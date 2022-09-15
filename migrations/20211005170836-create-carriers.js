"use strict";
module.exports = {
  up: async (queryInterface, DataTypes) => {
    await queryInterface.createTable("carriers", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      code: {
        type: DataTypes.STRING,
        unique: true,
      },
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      username: {
        type: DataTypes.STRING,
        unique: true,
      },
      name: {
        type: DataTypes.STRING,
      },
      phone: {
        type: DataTypes.STRING,
      },
      email: {
        type: DataTypes.STRING,
      },
      password: {
        type: DataTypes.STRING,
      },
      device_token: {
        type: DataTypes.STRING,
      },
      cash: {
        type: DataTypes.REAL,
        defaultValue: 0,
      },
      tasks_all: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      tasks_today: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      isExpress: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      ownerId: {
        type: DataTypes.INTEGER,
      },
      isBlocked: {
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
    await queryInterface.dropTable("carriers");
  },
};
