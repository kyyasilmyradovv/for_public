"use strict";
module.exports = {
  up: async (queryInterface, DataTypes) => {
    await queryInterface.createTable("campaignproducts", {
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
      productId: {
        type: DataTypes.INTEGER,
      },
      campaignId: {
        type: DataTypes.INTEGER,
      },
    });
  },
  down: async (queryInterface, DataTypes) => {
    await queryInterface.dropTable("campaignproducts");
  },
};
