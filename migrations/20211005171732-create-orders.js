"use strict";
module.exports = {
  up: async (queryInterface, DataTypes) => {
    await queryInterface.createTable("orders", {
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
      code: {
        type: DataTypes.STRING,
        unique: true,
      },
      payment_type: {
        type: DataTypes.STRING,
      },
      total_price: {
        type: DataTypes.REAL,
      },
      user_name: {
        type: DataTypes.STRING,
      },
      user_phone: {
        type: DataTypes.STRING,
      },
      address: {
        type: DataTypes.TEXT,
      },
      delivery_code: {
        type: DataTypes.STRING,
      },
      delivery_type: {
        type: DataTypes.STRING,
      },
      delivery_cost: {
        type: DataTypes.REAL,
      },
      delivery_time: {
        type: DataTypes.STRING,
      },
      rating: {
        type: DataTypes.REAL,
      },
      comment_by_user: {
        type: DataTypes.TEXT,
      },
      status: {
        type: DataTypes.ENUM(
          "pending",
          "accepted",
          "sent",
          "delivered",
          "not_delivered",
          "rejected"
        ),
        defaultValue: "pending",
      },
      isSynced: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      actionAt: {
        type: DataTypes.DATE,
      },
      note: {
        type: DataTypes.STRING,
      },
      carrierId: {
        type: DataTypes.INTEGER,
      },
      userId: {
        type: DataTypes.INTEGER,
      },
      ownerId: {
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
    await queryInterface.dropTable("orders");
  },
};
