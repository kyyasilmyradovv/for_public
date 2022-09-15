"use strict";
module.exports = {
  up: async (queryInterface, DataTypes) => {
    await queryInterface.createTable("carrierregions", {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      regionId: {
        type: DataTypes.INTEGER,
      },
      carrierId: {
        type: DataTypes.INTEGER,
      },
    });
  },
  down: async (queryInterface, DataTypes) => {
    await queryInterface.dropTable("carrierregions");
  },
};
