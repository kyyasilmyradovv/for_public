"use strict";
module.exports = {
  up: async (queryInterface, DataTypes) => {
    await queryInterface.createTable("addresses", {
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
      full: {
        type: DataTypes.TEXT,
      },
      regionId: {
        type: DataTypes.INTEGER,
      },
      userId: {
        type: DataTypes.INTEGER,
      },
      wholesalerId: {
        type: DataTypes.INTEGER,
      },
    });
  },
  down: async (queryInterface, DataTypes) => {
    await queryInterface.dropTable("addresses");
  },
};
