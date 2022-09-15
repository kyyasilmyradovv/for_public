"use strict";
module.exports = {
  up: async (queryInterface, DataTypes) => {
    await queryInterface.createTable("carriercollections", {
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
      stock_quantity: {
        type: DataTypes.INTEGER,
      },
      collectionId: {
        type: DataTypes.INTEGER,
      },
      carrierId: {
        type: DataTypes.INTEGER,
      },
    });
  },
  down: async (queryInterface, DataTypes) => {
    await queryInterface.dropTable("carriercollections");
  },
};
