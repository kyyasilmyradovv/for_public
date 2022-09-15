const bcrypt = require("bcryptjs");
const Op = require("sequelize").Op;
const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
const {
  Wholesalers,
  Worders,
  Products,
  Productimages,
  Woproducts,
} = require("../../models");

exports.getAllWholesalers = catchAsync(async (req, res) => {
  const { offset, limit } = req.query;
  const { count, rows } = await Wholesalers.findAndCountAll({
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

exports.getWholesaler = catchAsync(async (req, res) => {
  const wholesaler = await Wholesalers.findOne({
    where: { uuid: req.params.uuid },
  });
  return res.status(200).send(wholesaler);
});

exports.getWholesalerOrders = catchAsync(async (req, res) => {
  const {
    limit,
    offset,
    uuid,
    wholesalerId,
    code,
    payment_type,
    status,
    from,
    until,
  } = req.query;
  let where = {};
  if (uuid) where.uuid = uuid;
  if (wholesalerId) where.wholesalerId = wholesalerId;
  if (code) where.code = { [Op.like]: "%" + code.toUpperCase() + "%" };
  if (payment_type) where.payment_type = payment_type;
  if (status) where.status = status;
  if (from)
    where.createdAt = {
      [Op.gte]: from,
    };
  if (until)
    where.createdAt = {
      ...where.createdAt,
      [Op.lt]: until,
    };

  const { count, rows } = await Worders.findAndCountAll({
    where,
    include: {
      model: Products,
      as: "worder_products",
      attributes: [
        "code",
        "bar_code",
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

exports.addWholesaler = catchAsync(async (req, res, next) => {
  if (req.user.role != "superadmin") return next(new AppError("You cant", 403));
  const newWholesaler = await Wholesalers.create(req.body);
  return res.status(201).send(newWholesaler);
});

exports.editWholesaler = catchAsync(async (req, res, next) => {
  if (req.user.role != "superadmin") return next(new AppError("You cant", 403));
  const wholesaler = await Wholesalers.findOne({
    where: { uuid: req.params.uuid },
  });
  if (!wholesaler) return next(new AppError("Wholesaler not found", 404));

  if (req.body.password)
    req.body.password = await bcrypt.hash(req.body.password, 12);
  await wholesaler.update(req.body);

  return res.status(200).send(wholesaler);
});

exports.editOrder = catchAsync(async (req, res, next) => {
  if (req.user.role == "stock_operator")
    return next(new AppError("You cant", 403));
  const worder = await Worders.findOne({ where: { uuid: req.params.uuid } });
  if (!worder) return next(new AppError("Order not found", 404));

  await worder.update(req.body);

  return res.status(200).send(worder);
});

exports.deleteWholesaler = catchAsync(async (req, res, next) => {
  if (req.user.role != "superadmin") return next(new AppError("You cant", 403));
  const wholesaler = await Wholesalers.findOne({
    where: { uuid: req.params.uuid },
    include: [
      {
        model: Worders,
        as: "wholesaler_orders",
      },
    ],
  });
  if (!wholesaler) return next(new AppError("Wholesaler not found", 404));

  if (wholesaler.wholesaler_orders.length > 0)
    return next(
      new AppError("Wholesaler has order history, cannot be deleted", 400)
    );

  await wholesaler.destroy();

  return res.status(200).json({ msg: "Successfully Deleted" });
});

exports.deleteOrderProduct = catchAsync(async (req, res, next) => {
  if (req.user.role == "stock_operator")
    return next(new AppError("You cant", 403));
  const orderproduct = await Woproducts.findOne({
    where: { uuid: req.params.uuid },
  });
  if (!orderproduct) return next(new AppError("Order Product not found", 404));

  const worder = await Worders.findOne({
    where: { id: orderproduct.worderId },
  });

  await worder.update({
    total_price: worder.total_price - orderproduct.total_price,
  });
  await orderproduct.destroy();

  return res.status(200).json({ msg: "Product Successfully Removed" });
});
