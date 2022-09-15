const sharp = require("sharp");
const multer = require("multer");
const fs = require("fs");
const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");
const decodeBase64Image = require("./../../utils/decodeBase64Image");
const { search_body } = require("../../utils/search_body");
const {
  Categories,
  Brands,
  Products,
  Categoriesandbrands,
} = require("../../models");

exports.getAllCategories = catchAsync(async (req, res) => {
  const {
    limit,
    offset,
    type,
    isLeaf,
    isParent,
    canPublished,
    isActive,
    keyword,
  } = req.query;
  let where = {};
  if (keyword) where = search_body(keyword);
  if (type) where.type = type;
  if (isLeaf) where.isLeaf = isLeaf;
  if (isParent == "true") where.parentId = null;
  if (canPublished) where.canPublished = canPublished;
  if (isActive) where.isActive = isActive;

  const { count, rows } = await Categories.findAndCountAll({
    where,
    order: [["priority", "asc"]],
    limit,
    offset,
    include: {
      model: Products,
      as: "products",
      attributes: ["id"],
    },
    distinct: true,
  });

  for (category of rows) {
    category.dataValues.product_count = category.products.length;
    delete category.dataValues.products;
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

exports.getCategory = catchAsync(async (req, res) => {
  const category = await Categories.findOne({
    where: { uuid: req.params.uuid },
    include: {
      model: Brands,
      as: "category_brands",
    },
  });

  return res.status(200).send(category);
});

exports.addCategory = catchAsync(async (req, res, next) => {
  if (["operator", "stock_operator"].includes(req.user.role))
    return next(new AppError("You cant", 403));

  const newCategory = await Categories.create(req.body);
  for (brandId of req.body.brands) {
    await Categoriesandbrands.create({ brandId, categoryId: newCategory.id });
  }

  if (req.body.photo) {
    const photo = decodeBase64Image(req.body.photo);
    await sharp(photo.data)
      .toFormat("webp")
      .webp({ quality: 60 })
      .toFile(`./public/categories/${newCategory.uuid}.webp`);
    await newCategory.update({ image_isAdded: true });
  }

  return res.status(201).send(newCategory);
});

exports.editCategory = catchAsync(async (req, res, next) => {
  if (["operator", "stock_operator"].includes(req.user.role))
    return next(new AppError("You cant", 403));
  const category = await Categories.findOne({
    where: { uuid: req.params.uuid },
  });
  if (!category) return next(new AppError("Category not found", 404));
  await category.update(req.body);

  if (req.body.brands) {
    await Categoriesandbrands.destroy({ where: { categoryId: category.id } });
    for (brandId of req.body.brands) {
      await Categoriesandbrands.create({ brandId, categoryId: category.id });
    }
  }

  if (req.body.photo) {
    const photo = decodeBase64Image(req.body.photo);
    await sharp(photo.data)
      .toFormat("webp")
      .webp({ quality: 60 })
      .toFile(`./public/categories/${category.uuid}.webp`);
    await category.update({ image_isAdded: true });
  }

  return res.status(200).send(category);
});

exports.reorder = catchAsync(async (req, res, next) => {
  if (["operator", "stock_operator"].includes(req.user.role))
    return next(new AppError("You cant", 403));
  for (e of req.body) {
    await Categories.update({ priority: e.priority }, { where: { id: e.id } });
  }

  return res.status(200).json({ msg: "reordered" });
});

exports.deleteCategory = catchAsync(async (req, res, next) => {
  if (["operator", "stock_operator"].includes(req.user.role))
    return next(new AppError("You cant", 403));
  const category = await Categories.findOne({
    where: { uuid: req.params.uuid },
    include: [
      {
        model: Categories,
        as: "category_childs",
      },
      {
        model: Products,
        as: "products",
      },
    ],
  });
  if (!category) return next(new AppError("Category not found", 404));

  if (category.category_childs.length > 0 || category.products.length > 0)
    return next(new AppError("Category is not empty, you cant delete", 400));

  if (category.image_isAdded)
    fs.unlink(`./public/categories/${category.uuid}.webp`, function (err) {
      if (err) throw err;
    });

  await category.destroy();

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
