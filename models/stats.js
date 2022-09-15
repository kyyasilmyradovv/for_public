"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Stats extends Model {
    static associate() {}
  }
  Stats.init(
    {
      type: {
        type: DataTypes.STRING,
      },
      year: {
        type: DataTypes.INTEGER,
      },
      month: {
        type: DataTypes.INTEGER,
      },
      income: {
        type: DataTypes.REAL,
      },
      all: {
        type: DataTypes.INTEGER,
      },
      delivered: {
        type: DataTypes.INTEGER,
      },
      not_delivered: {
        type: DataTypes.INTEGER,
      },
      rejected: {
        type: DataTypes.INTEGER,
      },
    },
    {
      sequelize,
      timestamps: false,
      tableName: "stats",
      modelName: "Stats",
    }
  );
  return Stats;
};
