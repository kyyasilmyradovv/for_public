"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("ordercollections", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      price: {
        type: DataTypes.REAL,
      },
      total_price: {
        type: DataTypes.REAL,
      },
      discount_type: {
        type: DataTypes.STRING,
      },
      discount_amount: {
        type: DataTypes.REAL,
      },
      discount_required: {
        type: DataTypes.INTEGER,
      },
      discount_bonus: {
        type: DataTypes.INTEGER,
      },
      quantity: {
        type: DataTypes.INTEGER,
      },
      collectionId: {
        type: DataTypes.INTEGER,
      },
      orderId: {
        type: DataTypes.INTEGER,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("ordercollections");
  },
};
