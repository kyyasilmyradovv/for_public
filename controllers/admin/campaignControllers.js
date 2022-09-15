const sharp = require("sharp");
const multer = require("multer");
const fs = require("fs");
const { Op } = require("sequelize");
const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
const decodeBase64Image = require("./../../utils/decodeBase64Image");
const {
  Campaigns,
  Campaignproducts,
  Campaigncollections,
  Products,
  Productimages,
  Discounts,
  Brands,
  Categories,
  Collections,
} = require("../../models");

exports.getAllCampaigns = catchAsync(async (req, res) => {
  const { offset, limit } = req.query;
  let required = req.query.isActive == "true" ? true : false;
  const { count, rows } = await Campaigns.findAndCountAll({
    include: {
      model: Discounts,
      as: "discount",
      required,
    },
    order: [
      [{ model: Discounts, as: "discount" }, "id", "ASC"],
      ["id", "DESC"],
    ],
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

exports.getCampaign = catchAsync(async (req, res, next) => {
  let campaign = await Campaigns.findOne({
    where: { uuid: req.params.uuid },
    include: [
      {
        model: Products,
        as: "products",
        include: [
          {
            model: Productimages,
            as: "product_images",
          },
          {
            model: Discounts,
            as: "discount",
          },
        ],
      },
      {
        model: Collections,
        as: "collections",
        include: [
          {
            model: Discounts,
            as: "discount",
          },
          {
            model: Productimages,
            as: "images",
          },
        ],
      },
      {
        model: Discounts,
        as: "discount",
      },
    ],
  });
  if (!campaign) return next(new AppError("Campaign not found", 404));

  if (campaign.dataValues.categoryId != null) {
    campaign.dataValues.category = await Categories.findOne({
      where: { id: campaign.categoryId },
    });
  } else if (campaign.brandId != null) {
    campaign.dataValues.brand = await Brands.findOne({
      where: { id: campaign.brandId },
    });
  }

  return res.status(200).send(campaign);
});

exports.addCampaign = catchAsync(async (req, res, next) => {
  if (["operator", "stock_operator"].includes(req.user.role))
    return next(new AppError("You cant", 403));

  const newCampaign = await Campaigns.create(req.body);

  for (e of req.body.items) {
    if (e.type == "product") {
      await Campaignproducts.create({
        productId: e.id,
        campaignId: newCampaign.id,
      });
    } else if (e.type == "collection") {
      await Campaigncollections.create({
        collectionId: e.id,
        campaignId: newCampaign.id,
      });
    }
  }

  if (req.body.photo) {
    const photo = decodeBase64Image(req.body.photo);
    await sharp(photo.data)
      .toFormat("webp")
      .webp({ quality: 55 })
      .toFile(`./public/campaigns/original/${newCampaign.uuid}.webp`);
    await sharp(photo.data)
      .resize({ height: 300 })
      .toFormat("webp")
      .webp({ quality: 55 })
      .toFile(`./public/campaigns/preview/${newCampaign.uuid}.webp`);
    await newCampaign.update({
      image_isAdded: true,
    });
  }

  return res.status(201).send(newCampaign);
});

exports.editCampaign = catchAsync(async (req, res, next) => {
  if (["operator", "stock_operator"].includes(req.user.role))
    return next(new AppError("You cant", 403));

  const campaign = await Campaigns.findOne({
    where: { uuid: req.params.uuid },
  });
  if (!campaign) return next(new AppError("Campaign not found", 404));

  await campaign.update(req.body);

  if (req.body.items) {
    await Campaignproducts.destroy({ where: { campaignId: campaign.id } });
    await Campaigncollections.destroy({ where: { campaignId: campaign.id } });
    for (e of req.body.items) {
      if (e.type == "product") {
        await Campaignproducts.create({
          productId: e.id,
          campaignId: campaign.id,
        });
      } else if (e.type == "collection") {
        await Campaigncollections.create({
          collectionId: e.id,
          campaignId: campaign.id,
        });
      }
    }
  }

  if (req.body.photo) {
    const photo = decodeBase64Image(req.body.photo);
    await sharp(photo.data)
      .toFormat("webp")
      .webp({ quality: 60 })
      .toFile(`./public/campaigns/original/${campaign.uuid}.webp`);
    await sharp(photo.data)
      .resize({ height: 300 })
      .toFormat("webp")
      .webp({ quality: 60 })
      .toFile(`./public/campaigns/preview/${campaign.uuid}.webp`);
    await campaign.update({ image_isAdded: true });
  }

  return res.status(200).send(campaign);
});

exports.addDiscount = catchAsync(async (req, res, next) => {
  if (["operator", "stock_operator"].includes(req.user.role))
    return next(new AppError("You cant", 403));

  const oldDiscount = await Discounts.findOne({
    where: { campaignId: req.body.campaignId },
  });
  if (oldDiscount) return next(new AppError("Already has discount", 400));

  const newDiscount = await Discounts.create(req.body);

  const products = await Campaignproducts.findAll({
    where: { campaignId: req.body.campaignId },
  });
  const collections = await Campaigncollections.findAll({
    where: { campaignId: req.body.campaignId },
  });
  var product_ids = [],
    collection_ids = [];
  products.forEach((e) => {
    product_ids.push(e.productId);
  });
  collections.forEach((e) => {
    collection_ids.push(e.collectionId);
  });
  await Discounts.update(
    { to: req.body.to },
    {
      where: {
        [Op.or]: [{ productId: product_ids }, { collectionId: collection_ids }],
      },
    }
  );

  return res.status(201).send(newDiscount);
});

exports.deleteDiscount = catchAsync(async (req, res, next) => {
  if (["operator", "stock_operator"].includes(req.user.role))
    return next(new AppError("You cant", 403));

  const discount = await Discounts.findOne({
    where: { uuid: req.params.uuid },
  });
  if (!discount) return next(new AppError("Discount not found", 404));

  await discount.destroy();
  return res.status(200).json({ msg: "Successfully Deleted" });
});

exports.applyDiscount = catchAsync(async (req, res, next) => {
  if (["operator", "stock_operator"].includes(req.user.role))
    return next(new AppError("You cant", 400));

  const campaign = await Campaigns.findOne({
    where: { uuid: req.params.uuid },
    include: {
      model: Discounts,
      as: "discount",
      attributes: [
        "type",
        "amount",
        "required",
        "bonus",
        "from",
        "to",
        "dep_type",
        "collectionId",
        "productId",
      ],
      required: true,
    },
  });
  if (!campaign) return next(new AppError("Campaign not found/wrong", 404));

  if (req.body.to && req.body.to == "category") {
    const products = await Products.findAll({
      attributes: ["id"],
      include: {
        model: Categories,
        as: "categories",
        where: { id: req.body.id },
        attributes: [],
        required: true,
      },
    });
    req.body.items = [];
    products.forEach((e) => {
      req.body.items.push({ id: e.id, type: "product" });
    });
  } else if (req.body.to && req.body.to == "brand") {
    const products = await Products.findAll({
      where: { brandId: req.body.id },
      attributes: ["id"],
    });
    req.body.items = [];
    products.forEach((e) => {
      req.body.items.push({ id: e.id, type: "product" });
    });
  }

  var { type, amount, dep_type } = campaign.discount;
  if (type == "percentage") amount = (100 - amount) / 100;

  for (e of req.body.items) {
    if (e.type == "product") {
      await Discounts.destroy({ where: { productId: e.id } });
      await Discounts.create({
        ...campaign.dataValues.discount.dataValues,
        productId: e.id,
      });
      var item = await Products.findOne({ where: { id: e.id } });
    } else if (e.type == "collection") {
      await Discounts.destroy({ where: { collectionId: e.id } });
      await Discounts.create({
        ...campaign.dataValues.discount.dataValues,
        collectionId: e.id,
      });
      var item = await Collections.findOne({ where: { id: e.id } });
    }

    if (dep_type == "both") {
      if (type == "percentage") {
        item.price = item.given_price * amount;
        item.price_express = item.given_price * amount;
      } else if (type == "price") {
        item.price = item.given_price - amount;
        item.price_express = item.given_price - amount;
      }
    } else if (dep_type == "market") {
      if (type == "percentage") {
        item.price = item.given_price * amount;
      } else if (type == "price") {
        item.price = item.given_price - amount;
      }
    } else if (dep_type == "express") {
      if (type == "percentage") {
        item.price_express = item.given_price * amount;
      } else if (type == "price") {
        item.price_express = item.given_price - amount;
      }
    }

    await item.save();
  }

  return res.status(200).json({ msg: "Applied" });
});

exports.deleteCampaign = catchAsync(async (req, res, next) => {
  if (["operator", "stock_operator"].includes(req.user.role))
    return next(new AppError("You cant", 403));

  const uuid = req.params.uuid;
  const campaign = await Campaigns.findOne({ where: { uuid } });
  if (!campaign) return next(new AppError("Campaign not found", 404));

  if (campaign.image_isAdded) {
    fs.unlink(`./public/campaigns/original/${uuid}.webp`, function (err) {
      if (err) throw err;
    });
    fs.unlink(`./public/campaigns/preview/${uuid}.webp`, function (err) {
      if (err) throw err;
    });
  }

  await campaign.destroy();

  return res.status(200).json({ msg: "Successfully Deleted" });
});

// Multer Properties
const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
exports.uploadPhoto = upload.single("photo");
