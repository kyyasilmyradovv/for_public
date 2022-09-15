const { Op } = require("sequelize");
const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
const { Texts } = require("../../models");

exports.getAllTexts = catchAsync(async (req, res, next) => {
  if (["operator", "stock_operator"].includes(req.user.role))
    return next(new AppError("You cant", 403));

  var where = {};
  if (req.query.key) where.key = { [Op.like]: req.query.key + "%" };
  const texts = await Texts.findAll({ where });
  return res.status(200).send(texts);
});

exports.addText = catchAsync(async (req, res, next) => {
  if (["operator", "stock_operator"].includes(req.user.role))
    return next(new AppError("You cant", 403));
  const newText = await Texts.create(req.body);
  return res.status(200).send(newText);
});

exports.editText = catchAsync(async (req, res, next) => {
  if (["operator", "stock_operator"].includes(req.user.role))
    return next(new AppError("You cant", 403));

  const text = await Texts.findOne({ where: { uuid: req.params.uuid } });
  if (!text) return next(new AppError("Text not found", 404));

  await text.update(req.body);

  return res.status(200).send(text);
});

exports.deleteText = catchAsync(async (req, res, next) => {
  if (["operator", "stock_operator"].includes(req.user.role))
    return next(new AppError("You cant", 403));

  const text = await Texts.findOne({ where: { uuid: req.params.uuid } });
  if (!text) return next(new AppError("Text not found", 404));

  await text.destroy();

  return res.status(200).json({ msg: "Text Successfully Deleted" });
});
