"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("stats", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      type: {
        type: Sequelize.STRING,
      },
      year: {
        type: Sequelize.INTEGER,
      },
      month: {
        type: Sequelize.INTEGER,
      },
      income: {
        type: Sequelize.REAL,
      },
      all: {
        type: Sequelize.INTEGER,
      },
      delivered: {
        type: Sequelize.INTEGER,
      },
      not_delivered: {
        type: Sequelize.INTEGER,
      },
      rejected: {
        type: Sequelize.INTEGER,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("stats");
  },
};
