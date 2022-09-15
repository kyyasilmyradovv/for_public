const { Op } = require("sequelize");
const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
const {
  Texts,
  Deliveries,
  Deliverytimes,
  Faqs,
  Regions,
  Cities,
  Mobiles,
} = require("../../models");

exports.getAllTexts = catchAsync(async (req, res) => {
  var where = {};
  if (req.query.key) where.key = { [Op.like]: req.query.key + "%" };
  const texts = await Texts.findAll({ where });
  return res.status(200).send(texts);
});

exports.getAllDeliveries = catchAsync(async (req, res) => {
  const delivery_types = await Deliveries.findAll();
  const delivery_times = await Deliverytimes.findAll();
  return res.status(200).json({ delivery_types, delivery_times });
});

exports.getAllFaqs = catchAsync(async (req, res) => {
  const faqs = await Faqs.findAll();
  return res.status(200).send(faqs);
});

exports.getAllCities = catchAsync(async (req, res) => {
  const cities = await Cities.findAll({
    include: { model: Regions, as: "regions" },
  });
  return res.status(200).send(cities);
});

exports.register = catchAsync(async (req, res) => {
  const newSender = await Mobiles.create(req.body);
  return res.status(200).send(newSender);
});

exports.unregister = catchAsync(async (req, res, next) => {
  const sender = await Mobiles.findOne({ where: { id: req.params.id } });
  if (!sender) return next(new AppError("Not found", 404));
  await sender.destroy();
  return res.status(200).json({ msg: "Your Device Successfully Unregistered" });
});
