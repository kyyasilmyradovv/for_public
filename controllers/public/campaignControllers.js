const { Op } = require("sequelize");
const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
const {
  Campaigns,
  Categories,
  Products,
  Collections,
  sequelize,
} = require("../../models");
const {
  campaign_includes,
  campaign_atts,
  product_atts_few,
  collection_atts,
  product_includes_imd,
  collection_includes_imd,
} = require("../../utils/attributes");

const getCategoryChilds = async (id) => {
  const categories = await Categories.findAll({
    where: { id },
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
  return ids;
};

exports.getAllCampaigns = catchAsync(async (req, res) => {
  var { limit, offset } = req.query,
    dep_type = ["both", req.query.dep_type];
  const { count, rows } = await Campaigns.findAndCountAll({
    where: { isActive: true },
    attributes: campaign_atts,
    include: campaign_includes(null, dep_type)[0],
    order: [["id", "DESC"]],
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
    },
    data: rows,
  });
});

exports.getCampaignsForHome = catchAsync(async (req, res) => {
  var dep_type = ["both", req.query.dep_type],
    stock_type =
      req.query.dep_type == "market" ? "unordered" : "in_carrier_stock";
  const campaigns = await Campaigns.findAll({
    where: { isActive: true },
    include: campaign_includes(null, dep_type, stock_type),
    attributes: campaign_atts,
    order: sequelize.random(),
    limit: 6,
  });

  for (campaign of campaigns) {
    if (campaign.products.length == 0 && campaign.collections.length == 0) {
      if (campaign.brandId) {
        campaign.dataValues.products = await Products.findAll({
          where: {
            brandId: campaign.brandId,
            isActive: true,
            type: dep_type,
            [stock_type]: { [Op.gt]: 0 },
          },
          attributes: product_atts_few,
          order: sequelize.random(),
          include: product_includes_imd(dep_type),
          limit: 3,
        });
        campaign.dataValues.collections = await Collections.findAll({
          where: {
            brandId: campaign.brandId,
            isActive: true,
            type: dep_type,
            [stock_type]: { [Op.gt]: 0 },
          },
          attributes: collection_atts,
          order: sequelize.random(),
          include: collection_includes_imd(dep_type),
          limit: 3,
        });
      } else if (campaign.categoryId) {
        campaign.dataValues.products = await Products.findAll({
          where: {
            isActive: true,
            type: dep_type,
            [stock_type]: { [Op.gt]: 0 },
          },
          attributes: product_atts_few,
          order: sequelize.random(),
          include: [
            ...product_includes_imd(dep_type),
            {
              model: Categories,
              as: "categories",
              where: { id: await getCategoryChilds(campaign.categoryId) },
              attributes: [],
            },
          ],
          limit: 3,
        });
        campaign.dataValues.collections = await Collections.findAll({
          where: {
            isActive: true,
            type: dep_type,
            [stock_type]: { [Op.gt]: 0 },
          },
          attributes: collection_atts,
          order: sequelize.random(),
          include: [
            ...collection_includes_imd(dep_type),
            {
              model: Categories,
              as: "categories",
              where: { id: await getCategoryChilds(campaign.categoryId) },
              attributes: [],
            },
          ],
          limit: 3,
        });
      }
    }
  }

  return res.status(200).send(campaigns);
});

exports.getCampaign = catchAsync(async (req, res, next) => {
  let sort_by = req.query.sort_by || "id",
    as = req.query.as || "ASC",
    { price_from, price_to } = req.query,
    where = {},
    dep_type = ["both", req.query.dep_type],
    stock_type =
      req.query.dep_type == "market" ? "unordered" : "in_carrier_stock";
  if (price_from) where.price = { [Op.gte]: price_from };
  if (price_to) where.price = { ...where.price, [Op.lte]: price_to };

  let campaign = await Campaigns.findOne({
    where: { uuid: req.params.uuid, isActive: true },
    include: campaign_includes(where, dep_type, stock_type),
    order: [
      [{ model: Products, as: "products" }, sort_by, as],
      [{ model: Collections, as: "collections" }, sort_by, as],
    ],
    attributes: campaign_atts,
  });
  if (!campaign) return next(new AppError("Campaign not found", 404));

  if (campaign.products.length == 0 && campaign.collections.length == 0) {
    if (campaign.categoryId != null) {
      campaign.dataValues.products = await Products.findAll({
        where: {
          isActive: true,
          type: dep_type,
          [stock_type]: { [Op.gt]: 0 },
        },
        attributes: product_atts_few,
        order: [[sort_by, as]],
        include: [
          ...product_includes_imd(dep_type),
          {
            model: Categories,
            as: "categories",
            where: { id: await getCategoryChilds(campaign.categoryId) },
            attributes: [],
          },
        ],
      });
      campaign.dataValues.collections = await Collections.findAll({
        where: {
          isActive: true,
          type: dep_type,
          [stock_type]: { [Op.gt]: 0 },
        },
        attributes: collection_atts,
        order: [[sort_by, as]],
        include: [
          ...collection_includes_imd(dep_type),
          {
            model: Categories,
            as: "categories",
            where: { id: await getCategoryChilds(campaign.categoryId) },
            attributes: [],
          },
        ],
      });
    } else if (campaign.brandId != null) {
      campaign.dataValues.products = await Products.findAll({
        where: {
          brandId: campaign.brandId,
          isActive: true,
          type: dep_type,
          [stock_type]: { [Op.gt]: 0 },
        },
        attributes: product_atts_few,
        order: [[sort_by, as]],
        include: product_includes_imd(dep_type),
      });
      campaign.dataValues.collections = await Collections.findAll({
        where: {
          brandId: campaign.brandId,
          isActive: true,
          type: dep_type,
          [stock_type]: { [Op.gt]: 0 },
        },
        attributes: collection_atts,
        order: [[sort_by, as]],
        include: collection_includes_imd(dep_type),
      });
    }
  }

  return res.status(200).send(campaign);
});
