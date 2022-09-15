const Op = require("sequelize").Op;
const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
const {
  Stats,
  Orders,
  Worders,
  Products,
  Collections,
  Discounts,
} = require("../../models");

exports.getItemCounts = catchAsync(async (req, res) => {
  var models = [Products, Collections],
    model = models[req.query.model],
    active = 0,
    express = 0,
    sold = 0,
    where =
      req.query.model == 0
        ? { isActive: true, productId: { [Op.not]: null } }
        : { isActive: true, collectionId: { [Op.not]: null } };

  const items = await model.findAll({
    attributes: ["isActive", "type", "isEnoughInStock"],
  });
  const sale = await Discounts.count({ where });

  for (item of items) {
    if (item.isActive) active++;
    if (["express", "both"].includes(item.type)) express++;
    if (!item.isEnoughInStock) sold++;
  }

  return res.status(200).json({
    all: items.length,
    active,
    passive: items.length - active,
    express,
    sale,
    sold,
  });
});

exports.getCurrentStats = catchAsync(async (req, res) => {
  var today = {},
    this_week = {},
    this_month = {},
    DATE = new Date(),
    statuses = [
      "pending",
      "accepted",
      "sent",
      "delivered",
      "not_delivered",
      "rejected",
    ],
    times = [
      "createdAt",
      "actionAt",
      "actionAt",
      "actionAt",
      "actionAt",
      "actionAt",
    ],
    models = [Orders, Worders],
    model = models[req.query.model];

  // TODAY
  DATE.setHours(0, 0, 0, 0);
  today.income = (
    await model.sum("total_price", {
      where: {
        status: "delivered",
        actionAt: { [Op.gte]: DATE },
      },
    })
  ).toFixed(2);
  today.all = await model.count({
    where: { createdAt: { [Op.gte]: DATE } },
  });
  for (var i = 0; i < statuses.length; i++) {
    today[statuses[i]] = await model.count({
      where: {
        [times[i]]: { [Op.gte]: DATE },
        status: statuses[i],
      },
    });
  }

  // THIS WEEK
  DATE.setDate(DATE.getUTCDate() - DATE.getUTCDay() + 1);
  this_week.income = (
    await model.sum("total_price", {
      where: {
        status: "delivered",
        actionAt: { [Op.gte]: DATE },
      },
    })
  ).toFixed(2);
  this_week.all = await model.count({
    where: { createdAt: { [Op.gte]: DATE } },
  });
  for (var i = 0; i < statuses.length; i++) {
    this_week[statuses[i]] = await model.count({
      where: {
        [times[i]]: { [Op.gte]: DATE },
        status: statuses[i],
      },
    });
  }

  // THIS MONTH
  DATE.setDate(1);
  this_month.income = (
    await model.sum("total_price", {
      where: {
        status: "delivered",
        actionAt: { [Op.gte]: DATE },
      },
    })
  ).toFixed(2);
  this_month.all = await model.count({
    where: { createdAt: { [Op.gte]: DATE } },
  });
  for (var i = 0; i < statuses.length; i++) {
    this_month[statuses[i]] = await model.count({
      where: {
        [times[i]]: { [Op.gte]: DATE },
        status: statuses[i],
      },
    });
  }

  return res.status(200).json({
    today,
    this_week,
    this_month,
  });
});

exports.getIncome = catchAsync(async (req, res, next) => {
  var { from, until } = req.query,
    models = [Orders, Worders];
  var model = models[req.query.model];
  if (!from || !until)
    return next(new AppError("Please provide both dates", 400));

  const income = (
    await model.sum("total_price", {
      where: {
        status: "delivered",
        actionAt: { [Op.gte]: from, [Op.lt]: until },
      },
    })
  ).toFixed(2);

  return res.status(200).json({ income });
});

exports.getStats = catchAsync(async (req, res) => {
  var stats = {
    budget: {},
    count: {},
  };
  stats.orders = await Stats.findAll({
    where: { type: "order" },
    order: [["id", "DESC"]],
    limit: 7,
  });
  stats.worders = await Stats.findAll({
    where: { type: "worder" },
    order: [["id", "DESC"]],
    limit: 7,
  });
  stats.users = await Stats.findAll({
    where: { type: "users" },
    order: [["id", "DESC"]],
    limit: 7,
  });
  stats.budget.orders = await Stats.sum("income", { where: { type: "order" } });
  stats.budget.worders = await Stats.sum("income", {
    where: { type: "worder" },
  });
  stats.count.orders = await Stats.sum("all", { where: { type: "order" } });
  stats.count.worders = await Stats.sum("all", {
    where: { type: "worder" },
  });
  stats.count.users = await Stats.sum("all", { where: { type: "users" } });

  return res.status(200).send(stats);
});

exports.getLastSeven = catchAsync(async (req, res) => {
  var seven = {},
    DATE_start = new Date(),
    DATE_end = new Date();
  DATE_start.setHours(0, 0, 0, 0);
  DATE_end.setHours(0, 0, 0, 0);
  DATE_end.setDate(DATE_end.getUTCDate() + 2);

  for (var i = 0; i < 7; i++) {
    seven[i] = await Orders.count({
      where: {
        status: "delivered",
        actionAt: { [Op.gte]: DATE_start, [Op.lt]: DATE_end },
      },
    });
    DATE_start.setDate(DATE_start.getUTCDate());
    DATE_end.setDate(DATE_end.getUTCDate());
  }

  return res.status(200).send(seven);
});

exports.getTodayExpress = catchAsync(async (req, res) => {
  var today = {},
    DATE = new Date(),
    statuses = ["pending", "sent", "delivered", "not_delivered", "rejected"];
  DATE.setHours(0, 0, 0, 0);

  today.income = (
    await Orders.sum("total_price", {
      where: {
        delivery_type: "express",
        status: "delivered",
        actionAt: { [Op.gte]: DATE },
      },
    })
  ).toFixed(2);
  today.all = await Orders.count({
    where: { delivery_type: "express", createdAt: { [Op.gte]: DATE } },
  });
  for (var i = 0; i < statuses.length; i++) {
    today[statuses[i]] = await Orders.count({
      where: {
        delivery_type: "express",
        createdAt: { [Op.gte]: DATE },
        status: statuses[i],
      },
    });
  }

  return res.status(200).send(today);
});
