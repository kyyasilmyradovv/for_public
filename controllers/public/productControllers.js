const { Op } = require("sequelize");
const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
const { search_body } = require("../../utils/search_body");
const { Products, Categories, sequelize } = require("../../models");
const {
  product_atts_few,
  product_atts_more,
  product_includes,
  product_includes_for_price_range,
} = require("../../utils/attributes");

exports.getAllProducts = catchAsync(async (req, res) => {
  let {
      keyword,
      categoryIds,
      brandIds,
      hasDiscount,
      isNew,
      isHit,
      sort_by,
      as,
      price_from,
      price_to,
      dep_type,
    } = req.query,
    limit = req.query.limit || 20,
    offset = req.query.offset || 0,
    price_type = dep_type == "market" ? "price" : "price_express",
    stock_type = dep_type == "market" ? "unordered" : "in_carrier_stock";
  let order = [["id", "DESC"]],
    where = {},
    include = product_includes(),
    price_min = null,
    price_max = null;
  include[2].limit = 1;
  include[3].where.dep_type = ["both", dep_type];

  if (keyword) where = search_body(keyword);
  where = {
    ...where,
    isActive: true,
    type: ["both", dep_type],
    [stock_type]: { [Op.gt]: 0 },
  };
  if (dep_type == "market") {
    where.unordered = { [Op.gt]: 0 };
  } else if (dep_type == "express") {
    where.in_carrier_stock = { [Op.gt]: 0 };
  }
  if (brandIds) where.brandId = brandIds;
  if (hasDiscount == "true") include[3].required = true;
  if (isNew) where.isNew = isNew;
  if (isHit) where.isHit = isHit;
  if (sort_by && as) order = [[sort_by, as]];
  if (sort_by == "random") order = sequelize.random();
  if (categoryIds) {
    const categories = await Categories.findAll({
      where: { id: categoryIds },
      attributes: ["id"],
      include: {
        model: Categories,
        as: "category_childs",
        attributes: ["id"],
        include: {
          model: Categories,
          as: "category_childs",
          attributes: ["id"],
        },
      },
    });
    var ids = [];
    for (i of categories) {
      ids.push(i.id);
      for (j of i.category_childs) {
        ids.push(j.id);
        for (k of j.category_childs) {
          ids.push(k.id);
        }
      }
    }
    include[0].where = { id: ids };
  }

  const products = await Products.findAll({
    where,
    include: product_includes_for_price_range(
      include[0].where,
      include[3].where,
      include[3].required
    ),
    attributes: ["price", "price_express"],
  });
  if (products.length) {
    price_min = products[0][price_type];
    price_max = price_min;
    for (p of products) {
      if (p[price_type] < price_min) price_min = p[price_type];
      if (p[price_type] > price_max) price_max = p[price_type];
    }
  }

  if (price_from) where[price_type] = { [Op.gte]: price_from };
  if (price_to)
    where[price_type] = { ...where[price_type], [Op.lte]: price_to };

  const { count, rows } = await Products.findAndCountAll({
    where,
    include,
    attributes: product_atts_few,
    order,
    limit,
    offset,
    distinct: true,
  });

  return res.status(200).json({
    pagination: {
      all: count,
      limit,
      current_page: Math.floor(offset / limit) + 1,
      next: count - offset > limit,
      price_min,
      price_max,
    },
    products: rows,
  });
});

exports.getProduct = catchAsync(async (req, res, next) => {
  let type = ["both", req.query.dep_type],
    include = product_includes(),
    stock_type =
      req.query.dep_type == "market" ? "unordered" : "in_carrier_stock";
  include[3].where.dep_type = type;
  const product = await Products.findOne({
    where: {
      uuid: req.params.uuid,
      type,
      isActive: true,
      [stock_type]: { [Op.gt]: 0 },
    },
    attributes: product_atts_more,
    include,
  });
  if (!product) return next(new AppError("Product not found", 404));

  if (product.categories.length > 0) {
    var similar_products = await Products.findAll({
      where: {
        id: { [Op.not]: product.id },
        type,
        isActive: true,
        [stock_type]: { [Op.gt]: 0 },
      },
      include: [
        {
          model: Categories,
          as: "categories",
          where: { id: product.categories[0].id },
          attributes: [],
        },
        include[2],
        include[3],
      ],
      attributes: product_atts_more,
      limit: 5,
    });
  }

  return res.status(200).json({ product, similar_products });
});
