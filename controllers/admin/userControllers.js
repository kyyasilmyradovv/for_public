const bcrypt = require("bcryptjs");
const Op = require("sequelize").Op;
const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
const {
  Users,
  Orders,
  Productimages,
  Products,
  Addresses,
} = require("../../models");

exports.getAllUsers = catchAsync(async (req, res) => {
  const { limit, offset, keyword, isBlocked } = req.query;
  let where = {};
  if (keyword)
    where = {
      phone: {
        [Op.like]: "%" + keyword + "%",
      },
    };

  if (isBlocked) where.isBlocked = isBlocked;

  const { count, rows } = await Users.findAndCountAll({
    where,
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

exports.getUser = catchAsync(async (req, res) => {
  const user = await Users.findOne({
    where: { uuid: req.params.uuid },
    include: {
      model: Addresses,
      as: "addresses",
    },
  });
  return res.status(200).send(user);
});

exports.editUser = catchAsync(async (req, res, next) => {
  if (req.user.role == "stock_operator")
    return next(new AppError("You cant", 403));
  const user = await Users.findOne({ where: { uuid: req.params.uuid } });
  if (!user) return next(new AppError("User not found", 404));

  if (req.body.password)
    req.body.password = await bcrypt.hash(req.body.password, 12);
  await user.update(req.body);

  return res.status(200).send(user);
});

exports.getUserOrders = catchAsync(async (req, res) => {
  const { limit, offset, userId } = req.query;
  const { count, rows } = await Orders.findAndCountAll({
    where: { userId },
    order: [["id", "DESC"]],
    include: {
      model: Products,
      as: "order_products",
      include: {
        model: Productimages,
        as: "product_images",
      },
    },
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

exports.getOrderProducts = catchAsync(async (req, res) => {
  const order = await Orders.findOne({
    where: { id: req.query.orderId },
    include: {
      model: Products,
      as: "order_products",
      include: {
        model: Productimages,
        as: "product_images",
      },
    },
  });

  return res.status(200).send(order);
});
