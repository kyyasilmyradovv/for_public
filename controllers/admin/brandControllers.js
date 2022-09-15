const sharp = require("sharp");
const multer = require("multer");
const fs = require("fs");
const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
const decodeBase64Image = require("../../utils/decodeBase64Image");
const {
  Brands,
  Products,
  Categories,
  Categoriesandbrands,
} = require("../../models");
const { search_body } = require("../../utils/search_body");

exports.getAllBrands = catchAsync(async (req, res) => {
  let { limit, offset, canPublished, keyword, isActive } = req.query,
    where = {};
  if (keyword) where = search_body(keyword);
  if (canPublished) where.canPublished = canPublished;
  if (isActive) where.isActive = isActive;
  const { count, rows } = await Brands.findAndCountAll({
    where,
    include: {
      model: Products,
      as: "brand_products",
      attributes: ["id"],
    },
    order: [["id", "DESC"]],
    limit,
    offset,
    distinct: true,
  });

  for (brand of rows) {
    brand.dataValues.product_count = brand.brand_products.length;
    delete brand.dataValues.brand_products;
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

exports.getBrand = catchAsync(async (req, res, next) => {
  const brand = await Brands.findOne({
    where: { uuid: req.params.uuid },
    include: {
      model: Categories,
      as: "brand_categories",
      attributes: ["id", "uuid", "name_tm", "name_ru", "name_en"],
      through: { attributes: [] },
      required: false,
    },
  });
  if (!brand) return next(new AppError("Brand not found", 404));

  return res.status(200).send(brand);
});

exports.addBrand = catchAsync(async (req, res) => {
  if (["operator", "stock_operator"].includes(req.user.role))
    return next(new AppError("You cant", 403));

  const newBrand = await Brands.create(req.body);

  for (categoryId of req.body.categories) {
    await Categoriesandbrands.create({ brandId: newBrand.id, categoryId });
  }

  if (req.body.photo) {
    const photo = decodeBase64Image(req.body.photo);
    await sharp(photo.data)
      .toFormat("webp")
      .webp({ quality: 60 })
      .toFile(`./public/brands/${newBrand.uuid}.webp`);

    await newBrand.update({ image_isAdded: true });
  }

  return res.status(201).send(newBrand);
});

exports.editBrand = catchAsync(async (req, res, next) => {
  if (["operator", "stock_operator"].includes(req.user.role))
    return next(new AppError("You cant", 403));

  const brand = await Brands.findOne({ where: { uuid: req.params.uuid } });
  if (!brand) return next(new AppError("Brand not found", 404));
  await brand.update(req.body);

  if (req.body.categories) {
    await Categoriesandbrands.destroy({ where: { brandId: brand.id } });
    for (categoryId of req.body.categories) {
      await Categoriesandbrands.create({ brandId: brand.id, categoryId });
    }
  }

  if (req.body.photo) {
    const photo = decodeBase64Image(req.body.photo);
    await sharp(photo.data)
      .toFormat("webp")
      .webp({ quality: 60 })
      .toFile(`./public/brands/${brand.uuid}.webp`);
    await brand.update({ image_isAdded: true });
  }

  return res.status(200).send(brand);
});

exports.deleteBrand = catchAsync(async (req, res, next) => {
  if (["operator", "stock_operator"].includes(req.user.role))
    return next(new AppError("You cant", 403));

  const brand = await Brands.findOne({
    where: { uuid: req.params.uuid },
    include: {
      model: Products,
      as: "brand_products",
    },
  });
  if (!brand) return next(new AppError("Brand not found", 404));

  if (brand.brand_products.length > 0)
    return next(
      new AppError("Remove all Products from Brands to delete a Brand", 400)
    );
  if (brand.image_isAdded)
    fs.unlink(`./public/brands/${brand.uuid}.webp`, function (err) {
      if (err) throw err;
    });

  await brand.destroy();

  return res.status(200).json({ msg: brand });
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
