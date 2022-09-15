const sharp = require("sharp");
const multer = require("multer");
const fs = require("fs");
const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
const decodeBase64Image = require("./../../utils/decodeBase64Image");
const {
  Banners,
  Products,
  Productimages,
  Discounts,
  Campaigns,
  Brands,
  Categories,
  Collections,
} = require("../../models");

exports.getAllBanners = catchAsync(async (req, res) => {
  let { limit, offset, type, isActive } = req.query,
    where = {};
  if (type) where.type = type;
  if (isActive) where.isActive = isActive;

  const { count, rows } = await Banners.findAndCountAll({
    where,
    order: [["id", "DESC"]],
    limit,
    offset,
  });

  for (i of rows) {
    if (i.child_type == "product") {
      i.dataValues.child = await Products.findOne({
        where: { uuid: i.childId },
        attributes: ["uuid"],
      });
    } else if (i.child_type == "collection") {
      i.dataValues.child = await Collections.findOne({
        where: { uuid: i.childId },
        attributes: ["uuid"],
      });
    } else if (i.child_type == "category") {
      i.dataValues.child = await Categories.findOne({
        where: { id: i.childId },
        attributes: ["uuid"],
      });
    } else if (i.child_type == "brand") {
      i.dataValues.child = await Brands.findOne({
        where: { uuid: i.childId },
        attributes: ["uuid"],
      });
    } else if (i.child_type == "campaign") {
      i.dataValues.child = await Campaigns.findOne({
        where: { uuid: i.childId },
        attributes: ["uuid"],
      });
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

exports.getBanner = catchAsync(async (req, res, next) => {
  var banner = await Banners.findOne({ where: { uuid: req.params.uuid } });
  if (!banner) return next(new AppError("Banner not found", 404));

  if (banner.child_type == "product") {
    banner.dataValues.child = await Products.findOne({
      where: { uuid: banner.childId },
      include: [
        {
          model: Discounts,
          as: "discount",
        },
        {
          model: Productimages,
          as: "product_images",
          limit: 1,
        },
      ],
    });
  } else if (banner.child_type == "collection") {
    banner.dataValues.child = await Collections.findOne({
      where: { uuid: banner.childId },
      include: [
        {
          model: Discounts,
          as: "discount",
        },
        {
          model: Productimages,
          as: "images",
          limit: 1,
        },
      ],
    });
  } else if (banner.child_type == "category") {
    banner.dataValues.child = await Categories.findOne({
      where: { id: banner.childId },
    });
  } else if (banner.child_type == "brand") {
    banner.dataValues.child = await Brands.findOne({
      where: { uuid: banner.childId },
    });
  } else if (banner.child_type == "campaign") {
    banner.dataValues.child = await Campaigns.findOne({
      where: { uuid: banner.childId },
      include: {
        model: Discounts,
        as: "discount",
      },
    });
  }

  return res.status(200).send(banner);
});

exports.addBanner = catchAsync(async (req, res, next) => {
  if (["operator", "stock_operator"].includes(req.user.role))
    return next(new AppError("You cant", 403));
  const newBanner = await Banners.create(req.body);
  return res.status(201).send(newBanner);
});

exports.editBanner = catchAsync(async (req, res, next) => {
  if (["operator", "stock_operator"].includes(req.user.role))
    return next(new AppError("You cant", 403));

  const banner = await Banners.findOne({ where: { uuid: req.params.uuid } });
  if (!banner) return next(new AppError("Banner not found", 404));

  await banner.update(req.body);

  return res.status(200).send(banner);
});

exports.deleteBanner = catchAsync(async (req, res, next) => {
  if (["operator", "stock_operator"].includes(req.user.role))
    return next(new AppError("You cant", 403));

  const uuid = req.params.uuid;
  const banner = await Banners.findOne({ where: { uuid } });
  if (!banner) return next(new AppError("Banner not found", 404));

  let images = [
    "slider_image_tm",
    "slider_image_ru",
    "slider_image_en",
    "m_slider_image_tm",
    "m_slider_image_ru",
    "m_slider_image_en",
    "large_image_tm",
    "large_image_ru",
    "large_image_en",
    "medium_image_tm",
    "medium_image_ru",
    "medium_image_en",
  ];
  for (image of images) {
    if (banner[image])
      fs.unlink(`./public/banners/${image}/${uuid}.webp`, function (err) {
        if (err) throw err;
      });
  }

  await banner.destroy();
  return res.status(200).json({ msg: "Successfully Deleted" });
});

exports.deleteBannerImage = catchAsync(async (req, res, next) => {
  if (["operator", "stock_operator"].includes(req.user.role))
    return next(new AppError("You cant", 403));

  const uuid = req.params.uuid;
  const banner = await Banners.findOne({ where: { uuid } });
  if (!banner) return next(new AppError("Banner not found", 404));

  if (banner[req.body.key])
    fs.unlink(`./public/banners/${req.body.key}/${uuid}.webp`, function (err) {
      if (err) throw err;
    });

  await banner.update({ [req.body.key]: false });

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

exports.uploadBannerImage = catchAsync(async (req, res, next) => {
  if (["operator", "stock_operator"].includes(req.user.role))
    return next(new AppError("You cant", 403));

  if (!req.body.photo)
    return next(new AppError("Please provide Banner Image", 400));

  const uuid = req.params.uuid;
  const banner = await Banners.findOne({ where: { uuid } });
  if (!banner) return next(new AppError("Banner not found ", 404));

  const photo = decodeBase64Image(req.body.photo);
  await sharp(photo.data)
    .toFormat("webp")
    .webp({ quality: 70 })
    .toFile(`./public/banners/${req.body.key}/${uuid}.webp`);

  await banner.update({ [req.body.key]: true });

  return res.status(200).send(banner);
});
