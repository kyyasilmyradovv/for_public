const bcrypt = require("bcryptjs");
const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
const {
  Carriers,
  Carrierregions,
  Regions,
  Orders,
  Worders,
  Products,
  Collections,
  Productimages,
  Carriercollections,
  Carrierproducts,
} = require("../../models");

exports.getAllCarriers = catchAsync(async (req, res) => {
  let { limit, offset, isExpress, isBlocked, sort_by, as } = req.query;
  let order = [["id", "DESC"]],
    where = {};
  if (isExpress) where.isExpress = isExpress;
  if (isBlocked) where.isBlocked = isBlocked;
  if (sort_by && as) order = [[sort_by, as]];

  const { count, rows } = await Carriers.findAndCountAll({
    where,
    order,
    limit,
    offset,
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

exports.getCarriersForDelivery = catchAsync(async (req, res) => {
  let { limit, offset, regionId } = req.query;
  var where = {},
    required = false;
  if (regionId) {
    where.id = regionId;
    required = true;
  }
  const { count, rows } = await Carriers.findAndCountAll({
    where: { isBlocked: false },
    attributes: ["id", "uuid", "name", "tasks_today", "isExpress"],
    include: {
      model: Regions,
      as: "carrier_regions",
      attributes: ["id", "uuid", "name_tm", "name_ru", "name_en"],
      where,
      required,
    },
    order: [["tasks_today", "ASC"]],
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

exports.getCarrier = catchAsync(async (req, res) => {
  const carrier = await Carriers.findOne({
    where: { uuid: req.params.uuid },
    include: {
      model: Regions,
      as: "carrier_regions",
    },
  });
  return res.status(200).send(carrier);
});

exports.getCarrierItems = catchAsync(async (req, res) => {
  const carrier = await Carriers.findOne({
    where: { uuid: req.params.uuid },
    include: [
      {
        model: Products,
        as: "products",
        attributes: ["uuid", "name_tm", "name_ru", "name_en"],
        include: {
          model: Productimages,
          as: "product_images",
        },
      },
      {
        model: Collections,
        as: "collections",
        attributes: ["uuid", "name_tm", "name_ru", "name_en"],
      },
    ],
  });

  return res.status(200).json({
    products: carrier.products,
    collections: carrier.collections,
  });
});

exports.getCarrierOrders = catchAsync(async (req, res) => {
  const { limit, offset, carrierId } = req.query;
  const { count, rows } = await Orders.findAndCountAll({
    where: { carrierId },
    order: [["id", "DESC"]],
    limit,
    offset,
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

exports.getCarrierWorders = catchAsync(async (req, res) => {
  const { limit, offset, carrierId } = req.query;
  const { count, rows } = await Worders.findAndCountAll({
    where: { carrierId },
    order: [["id", "DESC"]],
    limit,
    offset,
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

exports.addCarrier = catchAsync(async (req, res, next) => {
  if (req.user.role != "superadmin") return next(new AppError("You cant", 403));
  const newCarrier = await Carriers.create(req.body);

  for (regionId of req.body.regionIds) {
    await Carrierregions.create({
      regionId,
      carrierId: newCarrier.id,
    });
  }

  return res.status(201).send(newCarrier);
});

exports.editCarrier = catchAsync(async (req, res, next) => {
  if (req.user.role != "superadmin") return next(new AppError("You cant", 403));
  const carrier = await Carriers.findOne({ where: { uuid: req.params.uuid } });
  if (!carrier) return next(new AppError("Carrier not found", 404));

  if (req.body.password)
    req.body.password = await bcrypt.hash(req.body.password, 12);
  await carrier.update(req.body);

  if (req.body.regionIds) {
    await Carrierregions.destroy({ where: { carrierId: carrier.id } });
    for (regionId of req.body.regionIds) {
      await Carrierregions.create({
        regionId,
        carrierId: carrier.id,
      });
    }
  }

  return res.status(200).send(carrier);
});

exports.updateCash = catchAsync(async (req, res, next) => {
  if (req.user.role == "stock_operator")
    return next(new AppError("You cant", 403));
  const carrier = await Carriers.findOne({ where: { uuid: req.params.uuid } });
  if (!carrier) return next(new AppError("Carrier not found", 404));

  var { cash, tasks_today, tasks_all } = req.body;
  if (tasks_today == 0) tasks_all = carrier.tasks_all + carrier.tasks_today;

  await carrier.update({ cash, tasks_today, tasks_all });

  return res.status(200).send(carrier);
});

exports.deleteCarrier = catchAsync(async (req, res, next) => {
  if (req.user.role != "superadmin") return next(new AppError("You cant", 403));
  const carrier = await Carriers.findOne({ where: { uuid: req.params.uuid } });
  if (!carrier) return next(new AppError("Carrier not found", 404));

  const order = await Orders.findOne({ where: { carrierId: carrier.id } });
  const worder = await Worders.findOne({ where: { carrierId: carrier.id } });
  if (order || worder) return next(new AppError("Cannot be deleted", 400));

  await carrier.destroy();

  return res.status(200).json({ msg: "Successfully Deleted" });
});

exports.editItems = catchAsync(async (req, res, next) => {
  if (req.user.role == "stock_operator")
    return next(new AppError("You cant", 403));
  const { carrierId } = req.body;

  const products = await Carrierproducts.findAll({ where: { carrierId } });
  const collections = await Carriercollections.findAll({
    where: { carrierId },
  });
  for (p of products) {
    const product = await Products.findOne({ where: { id: p.productId } });
    await product.update({
      in_carrier_stock: product.in_carrier_stock - p.stock_quantity,
    });
  }
  for (c of collections) {
    const collection = await Collections.findOne({
      where: { id: c.collectionId },
    });
    await collection.update({
      in_carrier_stock: collection.in_carrier_stock - c.stock_quantity,
    });
  }
  await Carrierproducts.destroy({ where: { carrierId } });
  await Carriercollections.destroy({ where: { carrierId } });

  for (item of req.body.items) {
    if (item.productId) {
      var cp = await Products.findOne({ where: { id: item.productId } });
      await Carrierproducts.create({
        stock_quantity: item.quantity,
        productId: item.productId,
        carrierId: req.body.carrierId,
      });
    } else if (item.collectionId) {
      var cp = await Collections.findOne({ where: { id: item.collectionId } });
      await Carriercollections.create({
        stock_quantity: item.quantity,
        collectionId: item.collectionId,
        carrierId: req.body.carrierId,
      });
    }
    await cp.update({ in_carrier_stock: cp.in_carrier_stock + item.quantity });
  }

  return res.status(200).json({ msg: "Items Added" });
});
