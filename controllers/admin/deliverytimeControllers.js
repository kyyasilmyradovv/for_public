const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
const { Deliverytimes } = require("../../models");

exports.getAllDeliverytimes = catchAsync(async (req, res) => {
  const deliverytimes = await Deliverytimes.findAll();
  return res.status(200).send(deliverytimes);
});

exports.addDeliverytime = catchAsync(async (req, res, next) => {
  if (["operator", "stock_operator"].includes(req.user.role))
    return next(new AppError("You cant", 403));
  const newDeliverytime = await Deliverytimes.create(req.body);
  return res.status(200).send(newDeliverytime);
});

exports.editDeliverytime = catchAsync(async (req, res, next) => {
  if (["operator", "stock_operator"].includes(req.user.role))
    return next(new AppError("You cant", 403));

  const deliverytime = await Deliverytimes.findOne({
    where: { uuid: req.params.uuid },
  });
  if (!deliverytime) return next(new AppError("Delivery time not found", 404));

  await deliverytime.update(req.body);

  return res.status(200).send(deliverytime);
});

exports.deleteDeliverytime = catchAsync(async (req, res, next) => {
  if (["operator", "stock_operator"].includes(req.user.role))
    return next(new AppError("You cant", 403));

  const deliverytime = await Deliverytimes.findOne({
    where: { uuid: req.params.uuid },
  });
  if (!deliverytime) return next(new AppError("Delivery time not found", 404));

  await deliverytime.destroy();

  return res.status(200).json({ msg: "Delivery Time Successfully Deleted" });
});
