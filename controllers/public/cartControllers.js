const { Op } = require("sequelize");
const catchAsync = require("../../utils/catchAsync");
const { Products, Collections } = require("../../models");
const {
  collection_atts,
  product_atts_few,
  product_includes_for_cart,
  collection_includes_for_cart,
} = require("../../utils/attributes");

exports.getMyCart = catchAsync(async (req, res) => {
  let { dep_type } = req.body,
    items = [],
    stock_type = dep_type == "market" ? "unordered" : "in_carrier_stock",
    where = {
      type: ["both", dep_type],
      isActive: true,
      [stock_type]: { [Op.gt]: 0 },
    };

  for (item of req.body.items) {
    if (dep_type == "express") where.express_max = { [Op.gte]: item.quantity };
    if (item.type == "product") {
      var cp = await Products.findOne({
        where: {
          uuid: item.uuid,
          ...where,
        },
        attributes: [...product_atts_few, stock_type],
        include: product_includes_for_cart(where.type),
      });
    } else if (item.type == "collection") {
      var cp = await Collections.findOne({
        where: {
          uuid: item.uuid,
          ...where,
        },
        attributes: [...collection_atts, stock_type],
        include: collection_includes_for_cart(where.type),
      });
    }

    if (cp) {
      cp.dataValues.quantity =
        cp[stock_type] > item.quantity ? item.quantity : cp[stock_type];
      if (!cp.isEnoughInStock)
        cp.dataValues.left = cp[stock_type] - cp.dataValues.quantity;
      delete cp.dataValues[stock_type];
      items.push(cp);
    }
  }

  return res.status(200).send(items);
});

exports.getMyFavs = catchAsync(async (req, res) => {
  var items = [];
  for (item of req.body.items) {
    if (item.type == "product") {
      var cp = await Products.findOne({
        where: {
          uuid: item.uuid,
          isActive: true,
          stock_quantity: { [Op.gt]: 0 },
        },
        attributes: product_atts_few,
        include: product_includes_for_cart(null),
      });
    } else if (item.type == "collection") {
      var cp = await Collections.findOne({
        where: {
          uuid: item.uuid,
          isActive: true,
          stock_quantity: { [Op.gt]: 0 },
        },
        attributes: collection_atts,
        include: collection_includes_for_cart(null),
      });
    }
    if (cp) items.push(cp);
  }

  return res.status(200).send(items);
});
