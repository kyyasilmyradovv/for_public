const { Op } = require("sequelize");
const catchAsync = require("../../utils/catchAsync");
const { Banners, sequelize } = require("../../models");
const { banner_atts } = require("./../../utils/attributes");

exports.getSliders = catchAsync(async (req, res) => {
  const banners = await Banners.findAll({
    where: {
      isActive: true,
      type: ["both", req.query.type || "market"],
      slider_image_tm: true,
    },
    order: [["id", "DESC"]],
    attributes: banner_atts,
  });
  return res.status(200).send(banners);
});

exports.getBannerForAdd = catchAsync(async (req, res, next) => {
  let limit = req.query.limit || 1,
    { categoryIds, brandId, type } = req.query,
    image_type = req.query.image_type + "_tm";
  var where = {
    child_type: ["product", "campaign"],
    [image_type]: true,
    type: ["both", type],
  };

  if (categoryIds) {
    where.child_categoryIds = { [Op.contains]: categoryIds };
  } else if (brandId) {
    where.child_brandId = brandId;
  }

  const banners = await Banners.findAll({
    where,
    attributes: [
      ...banner_atts,
      "slider_image_tm",
      "m_slider_image_tm",
      "large_image_tm",
      "medium_image_tm",
    ],
    order: [[sequelize.random()]],
    limit,
  });

  return res.status(200).send(banners);
});
