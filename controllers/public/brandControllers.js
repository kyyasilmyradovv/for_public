const catchAsync = require("../../utils/catchAsync");
const { Brands, Categories, sequelize } = require("../../models");
const { brand_atts } = require("./../../utils/attributes");
const { search_body } = require("../../utils/search_body");

exports.getAllBrands = catchAsync(async (req, res) => {
  let { limit, offset, categoryIds, keyword, random_order } = req.query,
    where = {};
  (cat_where = {}), (required = false), (order = [["id", "asc"]]);
  if (keyword) where = search_body(keyword);
  if (categoryIds) {
    cat_where = { id: categoryIds };
    required = true;
  }
  if (random_order == "true") order = sequelize.random();

  const { count, rows } = await Brands.findAndCountAll({
    where: { ...where, isActive: true },
    attributes: brand_atts,
    include: {
      model: Categories,
      as: "brand_categories",
      where: cat_where,
      attributes: [],
      required,
    },
    distinct: true,
    order,
    limit,
    offset,
  });

  return res.status(200).json({
    pagination: {
      all: count,
      limit,
      current_page: Math.floor(offset / limit) + 1,
      next: count - offset > limit,
    },
    data: rows,
  });
});

exports.getBrand = catchAsync(async (req, res, next) => {
  const brand = await Brands.findOne({
    where: { uuid: req.params.uuid },
    attributes: brand_atts,
    include: {
      model: Categories,
      as: "brand_categories",
      where: { canPublished: true, isActive: true },
      attributes: ["id", "uuid", "name_tm", "name_ru", "name_en"],
      through: { attributes: [] },
      required: false,
    },
  });
  if (!brand) return next(new AppError("Brand not found", 404));

  return res.status(200).send(brand);
});
