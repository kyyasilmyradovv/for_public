"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class addresses extends Model {
    static associate({ Users, Wholesalers, Regions }) {
      this.belongsTo(Users, {
        foreignKey: "userId",
        as: "user",
      });
      this.belongsTo(Wholesalers, {
        foreignKey: "wholesalerId",
        as: "wholesaler",
      });
      this.belongsTo(Regions, {
        foreignKey: "regionId",
        as: "region",
      });
    }
  }
  addresses.init(
    {
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
    },
    {
      sequelize,
      timestamps: false,
      tableName: "addresses",
      modelName: "Addresses",
    }
  );
  return addresses;
};
