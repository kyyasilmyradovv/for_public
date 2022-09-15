const { Op } = require("sequelize");
exports.search_body = (keyword) => {
  return {
    [Op.or]: [
      {
        name_tm: {
          [Op.iLike]: `%${keyword}%`,
        },
      },
      {
        name_ru: {
          [Op.iLike]: `%${keyword}%`,
        },
      },
      {
        name_en: {
          [Op.iLike]: `%${keyword}%`,
        },
      },
    ],
  };
};
