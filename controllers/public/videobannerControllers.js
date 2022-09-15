const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
const {
  Videobanners,
  Collections,
  Brands,
  Products,
  Productimages,
  Discounts,
} = require("../../models");
const {
  product_atts_more,
  collection_atts_more,
  brand_atts,
  product_atts_few,
} = require("../../utils/attributes");

exports.getAllVideobanners = catchAsync(async (req, res) => {
  let { limit, offset } = req.query;
  const { count, rows } = await Videobanners.findAndCountAll({
    include: {
      model: Products,
      as: "products",
      attributes: product_atts_more,
      include: [
        {
          model: Productimages,
          as: "product_images",
        },
        {
          model: Discounts,
          as: "discount",
          where: { isActive: true },
          required: false,
        },
      ],
    },
    order: [["id", "DESC"]],
    limit,
    offset,
    distinct: true,
  });

  for (i of rows) {
    if (i.products.length == 0) {
      if (i.collectionId != null) {
        i.dataValues.collection = await Collections.findOne({
          where: { id: i.collectionId },
          attributes: collection_atts_more,
          include: [
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
          ],
        });
      } else if (i.brandId != null) {
        i.dataValues.brand = await Brands.findOne({
          where: { id: i.brandId },
          attributes: brand_atts,
        });
      }
    }
  }

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

exports.getVideobanner = catchAsync(async (req, res, next) => {
  const videobanner = await Videobanners.findOne({
    where: { uuid: req.params.uuid },
    include: {
      model: Products,
      as: "products",
      attributes: product_atts_more,
      include: [
        {
          model: Productimages,
          as: "product_images",
        },
        {
          model: Discounts,
          as: "discount",
          where: { isActive: true },
          required: false,
        },
      ],
    },
  });
  if (!videobanner) return next(new AppError("Videobanner not found", 404));

  if (videobanner.products.length == 0) {
    if (videobanner.collectionId != null) {
      videobanner.dataValues.collection = await Collections.findOne({
        where: { id: videobanner.collectionId },
        attributes: collection_atts_more,
        include: [
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
        ],
      });
    } else if (videobanner.brandId != null) {
      videobanner.dataValues.brand = await Brands.findOne({
        where: { id: videobanner.brandId },
        attributes: brand_atts,
      });
    }
  }

  return res.status(200).send(videobanner);
});

exports.likeItem = catchAsync(async (req, res, next) => {
  const { type, uuid } = req.body;
  if (type == "product") {
    var cpv = await Products.findOne({ where: { uuid } });
  } else if (type == "collection") {
    var cpv = await Collections.findOne({ where: { uuid } });
  } else if (type == "videobanner") {
    var cpv = await Videobanners.findOne({ where: { uuid } });
  }
  if (!cpv) return next(new AppError(`${req.body.type} not found`, 404));

  await cpv.update({
    likes: cpv.likes.includes(req.user.id)
      ? cpv.likes.filter(function (e) {
          return e != req.user.id;
        })
      : [...cpv.likes, req.user.id],
  });

  return res.status(200).json({ msg: "done" });
});

exports.getSavedVideobanners = catchAsync(async (req, res) => {
  const videobanners = await Videobanners.findAll({
    where: { id: req.body.ids },
    include: {
      model: Products,
      as: "products",
      attributes: product_atts_more,
      include: [
        {
          model: Productimages,
          as: "product_images",
        },
        {
          model: Discounts,
          as: "discount",
          where: { isActive: true },
          required: false,
        },
      ],
    },
    distinct: true,
  });

  for (i of videobanners) {
    if (i.products.length == 0) {
      if (i.collectionId != null) {
        i.dataValues.collection = await Collections.findOne({
          where: { id: i.collectionId },
          attributes: collection_atts_more,
          include: [
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
          ],
        });
      } else if (i.brandId != null) {
        i.dataValues.brand = await Brands.findOne({
          where: { id: i.brandId },
          attributes: brand_atts,
        });
      }
    }
  }

  return res.status(200).send(videobanners);
});
