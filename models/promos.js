"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Promos extends Model {
    static associate() {}
  }
  Promos.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      code: {
        type: DataTypes.STRING,
        unique: true,
      },
      percent: {
        type: DataTypes.REAL,
      },
      dep_type: {
        type: DataTypes.STRING,
      },
      child_type: {
        type: DataTypes.STRING,
      },
      child_ids: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
      },
      use_max: {
        type: DataTypes.INTEGER,
      },
      from: {
        type: DataTypes.DATE,
      },
      to: {
        type: DataTypes.DATE,
      },
      isActive: {
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
    },
    {
      sequelize,
      tableName: "promos",
      modelName: "Promos",
    }
  );
  return Promos;
};
