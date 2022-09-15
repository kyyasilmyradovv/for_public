const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
const {
  Orders,
  Worders,
  Wholesalers,
  Productimages,
  Products,
} = require("../../models");

exports.getOrders = catchAsync(async (req, res, next) => {
  const limit = req.query.limit || 20;
  const offset = req.query.offset || 0;

  const { count, rows } = await Orders.findAndCountAll({
    where: { carrierId: req.user.id },
    attributes: [
      "uuid",
      "total_price",
      "payment_type",
      "user_name",
      "user_phone",
      "address",
      "address",
      "delivery_type",
      "delivery_time",
      "status",
      "note_by_carrier",
    ],
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

exports.getWorders = catchAsync(async (req, res, next) => {
  const limit = req.query.limit || 20;
  const offset = req.query.offset || 0;

  const { count, rows } = await Worders.findAndCountAll({
    where: { carrierId: req.user.id },
    attributes: [
      "uuid",
      "total_price",
      "payment_type",
      "address",
      "address",
      "delivery_time",
      "status",
      "note_by_carrier",
    ],
    include: {
      model: Wholesalers,
      as: "wholesaler",
      attributes: ["phone"],
    },
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

exports.editOrder = catchAsync(async (req, res, next) => {
  const order = await Orders.findOne({
    where: { uuid: req.params.uuid },
  });
  if (!order) return next(new AppError("Order not found", 404));

  await order.update({
    note_by_carrier: req.body.note_by_carrier,
    status: "not_delivered",
  });

  return res.status(200).json({ msg: "Successfully updated" });
});

exports.editWorder = catchAsync(async (req, res, next) => {
  const worder = await Worders.findOne({
    where: { uuid: req.params.uuid },
  });
  if (!worder) return next(new AppError("Wholesaler order did not found", 404));

  await worder.update({
    note_by_carrier: req.body.note_by_carrier,
    status: "not_delivered",
  });

  return res.status(200).json({ msg: "Successfully updated" });
});

exports.getOrderProducts = catchAsync(async (req, res, next) => {
  const order = await Orders.findOne({
    where: { uuid: req.params.uuid },
    include: {
      model: Products,
      as: "order_products",
      attributes: [
        "code",
        "name_tm",
        "name_ru",
        "name_en",
        "description_tm",
        "description_ru",
        "description_en",
        "weight",
        "volume",
      ],
      include: {
        model: Productimages,
        as: "product_images",
      },
    },
  });
  if (!order) {
    return next(new AppError("Order did not found with that ID", 404));
  }

  return res.status(201).json({ products: order.order_products });
});

exports.getWorderProducts = catchAsync(async (req, res, next) => {
  const worder = await Worders.findOne({
    where: { uuid: req.params.uuid },
    include: {
      model: Products,
      as: "worder_products",
      attributes: [
        "code",
        "name_tm",
        "name_ru",
        "name_en",
        "description_tm",
        "description_ru",
        "description_en",
        "weight",
        "volume",
      ],
      include: {
        model: Productimages,
        as: "product_images",
      },
    },
  });
  if (!worder) {
    return next(new AppError("Worder did not found with that ID", 404));
  }

  return res.status(201).json({ products: worder.worder_products });
});
