const { Op } = require("sequelize");
const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
const { search_body } = require("../../utils/search_body");
const {
  Collections,
  Products,
  Productimages,
  Discounts,
  Categories,
  Brands,
} = require("../../models");
const {
  product_atts_few,
  collection_atts,
  collection_atts_more,
  collection_includes,
  discount_atts,
} = require("./../../utils/attributes");

exports.getAllCollections = catchAsync(async (req, res) => {
  let {
      keyword,
      hasDiscount,
      sort_by,
      as,
      price_from,
      price_to,
      categoryIds,
      brandIds,
      dep_type,
      isHit,
      isNew,
    } = req.query,
    limit = req.query.limit || 20,
    offset = req.query.offset || 0,
    price_type = dep_type == "market" ? "price" : "price_express",
    stock_type = dep_type == "market" ? "unordered" : "in_carrier_stock";
  let order,
    required = false,
    where = {},
    cat_where,
    price_min = null,
    price_max = null;
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
  if (sort_by && as) order = [[sort_by, as]];
  if (hasDiscount == "true") required = true;
  if (brandIds) where.brandId = brandIds;
  if (isNew) where.isNew = isNew;
  if (isHit) where.isHit = isHit;
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
    cat_where = { id: ids };
  }

  var include = collection_includes(cat_where, ["both", dep_type], required);
  include[0].attributes = [];
  include[0].include = null;
  include[1].attributes = [];
  include[2] = include[3];
  include[2].attributes = [];
  include.length = 3;
  const collections = await Collections.findAll({
    where,
    include,
    attributes: ["price", "price_express"],
  });
  if (collections.length) {
    price_min = collections[0][price_type];
    price_max = price_min;
    for (p of collections) {
      if (p[price_type] < price_min) price_min = p[price_type];
      if (p[price_type] > price_max) price_max = p[price_type];
    }
  }
  if (price_from) where[price_type] = { [Op.gte]: price_from };
  if (price_to)
    where[price_type] = { ...where[price_type], [Op.lte]: price_to };

  const { count, rows } = await Collections.findAndCountAll({
    where,
    attributes: collection_atts,
    order,
    limit,
    offset,
    distinct: true,
    include: collection_includes(cat_where, ["both", dep_type], required),
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
    data: rows,
  });
});

exports.getCollection = catchAsync(async (req, res, next) => {
  var type = ["both", req.query.dep_type],
    stock_type =
      req.query.dep_type == "market" ? "unordered" : "in_carrier_stock";
  const collection = await Collections.findOne({
    where: {
      uuid: req.params.uuid,
      type,
      isActive: true,
      [stock_type]: { [Op.gt]: 0 },
    },
    attributes: collection_atts_more,
    include: [
      {
        model: Discounts,
        as: "discount",
        where: { dep_type: type, isActive: true },
        attributes: discount_atts,
        required: false,
      },
      {
        model: Products,
        as: "collection_products",
        attributes: product_atts_few,
        include: {
          model: Productimages,
          as: "product_images",
        },
      },
      {
        model: Productimages,
        as: "images",
      },
      {
        model: Brands,
        as: "brand",
        attributes: ["id", "uuid", "name_tm", "name_ru", "name_en"],
      },
    ],
  });
  if (!collection) return next(new AppError("Collection not found", 404));

  return res.status(200).send(collection);
});
