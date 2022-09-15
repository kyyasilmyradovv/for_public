const fs = require("fs");
const sharp = require("sharp");
const multer = require("multer");
const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
const { search_body } = require("../../utils/search_body");
const decodeBase64Image = require("../../utils/decodeBase64Image");
const {
  Collections,
  Collectionproducts,
  Collectioncategories,
  Categories,
  Discounts,
  Products,
  Productimages,
} = require("../../models");

exports.getAllCollections = catchAsync(async (req, res) => {
  let {
    limit,
    offset,
    type,
    keyword,
    canPublished,
    isActive,
    hasDiscount,
    categoryIds,
    brandIds,
    isHit,
    isNew,
    isEnoughInStock,
  } = req.query;
  let where = {},
    required = false,
    cat_where;

  if (keyword) where = search_body(keyword);
  if (type) where.type = [type, "both"];
  if (isActive) where.isActive = isActive;
  if (canPublished) where.canPublished = canPublished;
  if (hasDiscount == "true") required = true;
  if (brandIds) where.brandId = brandIds;
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
    cat_where = { id: ids };
  }

  const { count, rows } = await Collections.findAndCountAll({
    where,
    include: [
      {
        model: Categories,
        as: "categories",
        where: cat_where,
        attributes: ["id", "name_tm", "name_ru", "name_en"],
      },
      {
        model: Discounts,
        as: "discount",
        required,
      },
      {
        model: Productimages,
        as: "images",
        limit: 1,
      },
    ],
    limit,
    offset,
    order: [["id", "DESC"]],
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

exports.getCollection = catchAsync(async (req, res, next) => {
  const collection = await Collections.findOne({
    where: { uuid: req.params.uuid },
    include: [
      {
        model: Categories,
        as: "categories",
      },
      {
        model: Discounts,
        as: "discount",
      },
      {
        model: Products,
        as: "collection_products",
        include: {
          model: Productimages,
          as: "product_images",
          limit: 1,
        },
      },
      {
        model: Productimages,
        as: "images",
      },
    ],
  });
  if (!collection) return next(new AppError("Collection not found", 404));

  return res.status(200).send(collection);
});

exports.addCollection = catchAsync(async (req, res, next) => {
  if (["operator", "stock_operator"].includes(req.user.role))
    return next(new AppError("You cant", 403));

  if (req.body.given_price) {
    req.body.price = req.body.given_price;
    req.body.price_express = req.body.given_price;
  }
  const newCollection = await Collections.create(req.body);

  for (product of req.body.products) {
    const prod = await Products.findOne({
      where: { id: product.id },
    });
    if (
      prod.stock_quantity - newCollection.stock_quantity * product.quantity <
      0
    ) {
      await newCollection.destroy();
      return next(new AppError("Not enough stock of product/s", 403));
    }
    await Collectionproducts.create({
      quantity: product.quantity,
      productId: prod.id,
      collectionId: newCollection.id,
    });
    await prod.update({
      stock_quantity:
        prod.stock_quantity - newCollection.stock_quantity * product.quantity,
    });
  }

  for (categoryId of req.body.categories) {
    await Collectioncategories.create({
      categoryId,
      collectionId: newCollection.id,
    });
  }

  return res.status(201).send(newCollection);
});

exports.addDiscount = catchAsync(async (req, res, next) => {
  if (["operator", "stock_operator"].includes(req.user.role))
    return next(new AppError("You cant", 403));

  var { collectionId, dep_type } = req.body;
  const oldDiscount = await Discounts.findOne({ where: { collectionId } });
  if (oldDiscount) return next(new AppError("Already has discount", 400));
  const collection = await Collections.findOne({
    where: { id: collectionId, type: [dep_type, "both"] },
  });
  if (!collection) return next(new AppError("Collection not found/wrong", 404));

  const newDiscount = await Discounts.create(req.body);

  return res.status(201).send(newDiscount);
});

exports.editCollection = catchAsync(async (req, res, next) => {
  if (["operator", "stock_operator"].includes(req.user.role))
    return next(new AppError("You cant", 403));

  const collection = await Collections.findOne({
    where: { uuid: req.params.uuid },
    include: [
      {
        model: Discounts,
        as: "discount",
        where: { isActive: true },
        required: false,
      },
      { model: Products, as: "collection_products" },
    ],
  });
  if (!collection) return next(new AppError("Collection not found", 404));

  if (req.body.given_price) {
    req.body.price = req.body.given_price;
    req.body.price_express = req.body.given_price;
  }
  if (req.body.given_price && collection.discount != null) {
    if (collection.discount.type == "percentage") {
      let amount = (100 - collection.discount.amount) / 100;
      if (collection.discount.dep_type == "both") {
        req.body.price = (req.body.given_price * amount).toFixed(2);
        req.body.price_express = req.body.price;
      } else if (collection.discount.dep_type == "market") {
        req.body.price = (req.body.given_price * amount).toFixed(2);
      } else if (collection.discount.dep_type == "express") {
        req.body.price_express = (req.body.given_price * amount).toFixed(2);
      }
    } else if (collection.discount.type == "price") {
      if (collection.discount.dep_type == "both") {
        req.body.price = req.body.given_price - collection.discount.amount;
        req.body.price_express = req.body.price;
      } else if (collection.discount.dep_type == "market") {
        req.body.price = req.body.given_price - collection.discount.amount;
      } else if (collection.discount.dep_type == "express") {
        req.body.price_express =
          req.body.given_price - collection.discount.amount;
      }
    }
  }

  const old_stock_quantity = collection.stock_quantity;
  if (req.body.products) {
    if (collection.collection_products) {
      for (col_prod of collection.collection_products) {
        const product = await Products.findOne({
          where: { id: col_prod.Collectionproducts.productId },
        });
        await product.update({
          stock_quantity:
            product.stock_quantity +
            col_prod.Collectionproducts.quantity * old_stock_quantity,
        });
        await Collectionproducts.destroy({
          where: { uuid: col_prod.Collectionproducts.uuid },
        });
      }
    }

    for (product of req.body.products) {
      const prod = await Products.findOne({ where: { id: product.id } });
      if (
        prod.stock_quantity - collection.stock_quantity * product.quantity <
        0
      )
        return next(new AppError("Not enough stock of product/s", 400));
      await Collectionproducts.create({
        quantity: product.quantity,
        productId: prod.id,
        collectionId: collection.id,
      });
      await prod.update({
        stock_quantity:
          prod.stock_quantity - collection.stock_quantity * product.quantity,
      });
    }
  }

  if (req.body.categories) {
    await Collectioncategories.destroy({
      where: { collectionId: collection.id },
    });
    for (categoryId of req.body.categories) {
      await Collectioncategories.create({
        categoryId,
        collectionId: collection.id,
      });
    }
  }

  await collection.update(req.body);

  return res.status(200).send(collection);
});

exports.deleteCollection = catchAsync(async (req, res, next) => {
  if (["operator", "stock_operator"].includes(req.user.role))
    return next(new AppError("You cant", 403));

  const collection = await Collections.findOne({
    where: { uuid: req.params.uuid },
    include: [
      {
        model: Products,
        as: "collection_products",
      },
      {
        model: Productimages,
        as: "images",
      },
    ],
  });
  if (!collection) return next(new AppError("Collection not found", 404));

  if (collection.collection_products.length > 0)
    return next(
      new AppError("Remove all Products from Collection to delete it", 404)
    );

  if (collection.images)
    for (image of collection.images) {
      fs.unlink(
        `./public/collections/preview/${image.uuid}.webp`,
        function (err) {
          if (err) throw err;
        }
      );
      fs.unlink(
        `./public/collections/original/${image.uuid}.webp`,
        function (err) {
          if (err) throw err;
        }
      );
    }

  await collection.destroy();

  return res.status(200).json({ msg: "Successfully Deleted" });
});

exports.deleteDiscount = catchAsync(async (req, res, next) => {
  if (["operator", "stock_operator"].includes(req.user.role))
    return next(new AppError("You cant", 403));

  const discount = await Discounts.findOne({
    where: { uuid: req.params.uuid },
  });
  if (!discount) return next(new AppError("Discount not found", 404));

  const collection = await Collections.findOne({
    where: { id: discount.collectionId },
  });

  if (discount.dep_type == "both") {
    collection.price = collection.given_price;
    collection.price_express = collection.given_price;
  } else if (discount.dep_type == "market") {
    collection.price = collection.given_price;
  } else if (discount.dep_type == "express") {
    collection.price_express = collection.given_price;
  }
  await collection.save();

  await discount.destroy();
  return res.status(200).json({ msg: "Successfully Deleted" });
});

exports.deleteCollectionImage = catchAsync(async (req, res, next) => {
  if (["operator", "stock_operator"].includes(req.user.role))
    return next(new AppError("You cant", 403));

  const { uuid } = req.params;
  const collectionimage = await Productimages.findOne({ where: { uuid } });
  if (!collectionimage)
    return next(new AppError("Collectionimage not found", 404));

  fs.unlink(`./public/collections/preview/${uuid}.webp`, function (err) {
    if (err) throw err;
  });
  fs.unlink(`./public/collections/original/${uuid}.webp`, function (err) {
    if (err) throw err;
  });

  await collectionimage.destroy();

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

exports.uploadCollectionImage = catchAsync(async (req, res, next) => {
  if (["operator", "stock_operator"].includes(req.user.role))
    return next(new AppError("You cant", 403));

  if (!req.body.photo)
    return next(new AppError("Please provide Collection Image", 400));

  const uuid = req.params.uuid;
  const collection = await Collections.findOne({ where: { uuid } });
  if (!collection) return next(new AppError("Collection not found", 404));

  const newImage = await Productimages.create({ collectionId: collection.id });

  const photo = decodeBase64Image(req.body.photo);
  await sharp(photo.data)
    .toFormat("webp")
    .toFile(`./public/collections/original/${newImage.uuid}.webp`);
  await sharp(photo.data)
    .resize({ height: 300 })
    .toFormat("webp")
    .webp({ quality: 80 })
    .toFile(`./public/collections/preview/${newImage.uuid}.webp`);

  return res.status(200).json({ msg: "Photo Successfully Uploaded" });
});
