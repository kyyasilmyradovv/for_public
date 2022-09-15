const fs = require("fs");
const multer = require("multer");
const sharp = require("sharp");
const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
const { search_body } = require("../../utils/search_body");
const decodeBase64Image = require("../../utils/decodeBase64Image");
const {
  Products,
  Users,
  Productimages,
  Videobanners,
  Collections,
  Worders,
  Supplierorders,
  Orders,
  Discounts,
  Productcategories,
  Categories,
} = require("../../models");
const { product_includes_for_admin } = require("../../utils/attributes");

exports.getAllProducts = catchAsync(async (req, res) => {
  let {
    limit,
    offset,
    keyword,
    categoryIds,
    brandIds,
    supplierIds,
    isActive,
    canPublished,
    hasDiscount,
    isBulk,
    type,
    isNew,
    isHit,
    isEnoughInStock,
  } = req.query;

  let where = {},
    include = product_includes_for_admin(hasDiscount == "true");
  include[2].limit = 1;

  if (keyword) where = search_body(keyword);
  if (brandIds) where.brandId = brandIds;
  if (supplierIds) where.supplierId = supplierIds;
  if (isActive) where.isActive = isActive;
  if (canPublished) where.canPublished = canPublished;
  if (isBulk) where.isBulk = isBulk;
  if (type) where.type = [type, "both"];
  if (isNew) where.isNew = isNew;
  if (isHit) where.isHit = isHit;
  if (isEnoughInStock) where.isEnoughInStock = isEnoughInStock;
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

  const { count, rows } = await Products.findAndCountAll({
    where,
    limit,
    offset,
    order: [["id", "desc"]],
    distinct: true,
    include,
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

exports.getStockProducts = catchAsync(async (req, res) => {
  const suppliers = await Users.findAll({
    where: { isSupplier: true, isBlocked: false },
    attributes: ["id", "uuid", "name", "phone", "company_name"],
    include: {
      model: Products,
      as: "supplier_products",
      where: { isEnoughInStock: false },
      attributes: [
        "id",
        "uuid",
        "code",
        "bar_code",
        "shelf_code",
        "name_tm",
        "name_ru",
        "name_en",
        "stock_quantity",
        "stock_min",
      ],
      include: [
        {
          model: Productimages,
          as: "product_images",
          limit: 1,
        },
        {
          model: Supplierorders,
          as: "supplierorder",
          where: { status: ["pending", "accepted"] },
          required: false,
        },
      ],
    },
  });

  const unsupplied_products = await Products.findAll({
    where: { isEnoughInStock: false, supplierId: null },
    attributes: [
      "id",
      "uuid",
      "code",
      "bar_code",
      "shelf_code",
      "name_tm",
      "name_ru",
      "name_en",
      "stock_quantity",
      "stock_min",
    ],
    include: {
      model: Productimages,
      as: "product_images",
      limit: 1,
    },
  });

  return res.status(200).json({ suppliers, unsupplied_products });
});

exports.getProduct = catchAsync(async (req, res, next) => {
  const product = await Products.findOne({
    where: { uuid: req.params.uuid },
    include: product_includes_for_admin(),
  });
  if (!product) return next(new AppError("Product not found", 404));

  return res.status(200).send(product);
});

exports.addProduct = catchAsync(async (req, res, next) => {
  if (["operator", "stock_operator"].includes(req.user.role))
    return next(new AppError("You cant", 403));

  if (req.body.given_price) {
    req.body.price = req.body.given_price;
    req.body.price_express = req.body.given_price;
  }
  const newProduct = await Products.create(req.body);

  for (categoryId of req.body.categories) {
    await Productcategories.create({
      categoryId,
      productId: newProduct.id,
    });
  }

  return res.status(201).send(newProduct);
});

exports.addDiscount = catchAsync(async (req, res, next) => {
  if (["operator", "stock_operator"].includes(req.user.role))
    return next(new AppError("You cant", 403));

  var { productId, dep_type } = req.body;
  const oldDiscount = await Discounts.findOne({ where: { productId } });
  if (oldDiscount) return next(new AppError("Already has discount", 400));
  const product = await Products.findOne({
    where: { id: productId, type: [dep_type, "both"] },
  });
  if (!product) return next(new AppError("Product not found/wrong", 404));

  const newDiscount = await Discounts.create(req.body);

  return res.status(201).send(newDiscount);
});

exports.editProduct = catchAsync(async (req, res, next) => {
  if (["operator", "stock_operator"].includes(req.user.role))
    return next(new AppError("You cant", 403));

  const product = await Products.findOne({
    where: { uuid: req.params.uuid },
    include: {
      model: Discounts,
      as: "discount",
      where: { isActive: true },
      required: false,
    },
  });
  if (!product) return next(new AppError("Product not found", 404));

  if (req.body.given_price) {
    req.body.price = req.body.given_price;
    req.body.price_express = req.body.given_price;
  }
  if (req.body.given_price && product.discount != null) {
    if (product.discount.type == "percentage") {
      let amount = (100 - product.discount.amount) / 100;
      if (product.discount.dep_type == "both") {
        req.body.price = (req.body.given_price * amount).toFixed(2);
        req.body.price_express = req.body.price;
      } else if (product.discount.dep_type == "market") {
        req.body.price = (req.body.given_price * amount).toFixed(2);
      } else if (product.discount.dep_type == "express") {
        req.body.price_express = (req.body.given_price * amount).toFixed(2);
      }
    } else if (product.discount.type == "price") {
      if (product.discount.dep_type == "both") {
        req.body.price = req.body.given_price - product.discount.amount;
        req.body.price_express = req.body.price;
      } else if (product.discount.dep_type == "market") {
        req.body.price = req.body.given_price - product.discount.amount;
      } else if (product.discount.dep_type == "express") {
        req.body.price_express = req.body.given_price - product.discount.amount;
      }
    }
  }

  await product.update(req.body);

  if (req.body.categories) {
    await Productcategories.destroy({ where: { productId: product.id } });
    for (categoryId of req.body.categories) {
      await Productcategories.create({
        categoryId,
        productId: product.id,
      });
    }
  }

  return res.status(200).send(product);
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
  if (["operator", "stock_operator"].includes(req.user.role))
    return next(new AppError("You cant", 403));

  const product = await Products.findOne({
    where: {
      uuid: req.params.uuid,
    },
    include: [
      {
        model: Collections,
        as: "collection",
      },
      {
        model: Worders,
        as: "worder",
      },
      {
        model: Orders,
        as: "order",
      },
      {
        model: Videobanners,
        as: "videobanner",
      },
      {
        model: Supplierorders,
        as: "supplierorder",
      },
      {
        model: Productimages,
        as: "product_images",
      },
    ],
  });
  if (!product) return next(new AppError("Product not found", 404));

  if (
    product.collection.length > 0 ||
    product.worder.length > 0 ||
    product.supplierorder.length > 0 ||
    product.order.length > 0 ||
    product.videobanner.length > 0
  )
    return next(
      new AppError("Product has assoications, cannot be deleted", 400)
    );

  product.product_images.forEach((image) => {
    fs.unlink(`./public/products/preview/${image.uuid}.webp`, function (err) {
      if (err) throw err;
    });
    fs.unlink(`./public/products/original/${image.uuid}.webp`, function (err) {
      if (err) throw err;
    });
  });

  await product.destroy();
  return res.status(200).json({ msg: "Successfully Deleted" });
});

exports.deleteDiscount = catchAsync(async (req, res, next) => {
  if (["operator", "stock_operator"].includes(req.user.role))
    return next(new AppError("You cant", 403));

  const discount = await Discounts.findOne({
    where: { uuid: req.params.uuid },
  });
  if (!discount) return next(new AppError("Discount not found", 404));

  const product = await Products.findOne({ where: { id: discount.productId } });

  if (discount.dep_type == "both") {
    product.price = product.given_price;
    product.price_express = product.given_price;
  } else if (discount.dep_type == "market") {
    product.price = product.given_price;
  } else if (discount.dep_type == "express") {
    product.price_express = product.given_price;
  }
  await product.save();

  await discount.destroy();
  return res.status(200).json({ msg: "Successfully Deleted" });
});

exports.deleteProductImage = catchAsync(async (req, res, next) => {
  if (["operator", "stock_operator"].includes(req.user.role))
    return next(new AppError("You cant", 403));

  const { uuid } = req.params;
  const productimage = await Productimages.findOne({ where: { uuid } });
  if (!productimage) return next(new AppError("Productimage not found", 404));

  fs.unlink(`./public/products/preview/${uuid}.webp`, function (err) {
    if (err) throw err;
  });
  fs.unlink(`./public/products/original/${uuid}.webp`, function (err) {
    if (err) throw err;
  });

  await productimage.destroy();

  return res.status(200).json({ msg: "Successfully deleted" });
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

exports.uploadProductImage = catchAsync(async (req, res, next) => {
  if (["operator", "stock_operator"].includes(req.user.role))
    return next(new AppError("You cant", 403));

  if (!req.body.photo)
    return next(new AppError("Please provide Product Image", 400));

  const product = await Products.findOne({ where: { uuid: req.params.uuid } });
  if (!product) return next(new AppError("Product not found", 404));

  const newProductimage = await Productimages.create({ productId: product.id });

  const photo = decodeBase64Image(req.body.photo);
  await sharp(photo.data)
    .toFormat("webp")
    .toFile(`./public/products/original/${newProductimage.uuid}.webp`);
  await sharp(photo.data)
    .resize({ height: 300 })
    .toFormat("webp")
    .webp({ quality: 80 })
    .toFile(`./public/products/preview/${newProductimage.uuid}.webp`);

  return res.status(200).json({ msg: "Photo Successfully uploaded" });
});
