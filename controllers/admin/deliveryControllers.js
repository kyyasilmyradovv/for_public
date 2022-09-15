const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
const { Deliveries } = require("../../models");

exports.getAllDeliveries = catchAsync(async (req, res) => {
  const deliveries = await Deliveries.findAll();
  return res.status(200).send(deliveries);
});

exports.addDelivery = catchAsync(async (req, res, next) => {
  if (["operator", "stock_operator"].includes(req.user.role))
    return next(new AppError("You cant", 403));
  const newDelivery = await Deliveries.create(req.body);
  return res.status(200).send(newDelivery);
});

exports.editDelivery = catchAsync(async (req, res, next) => {
  if (["operator", "stock_operator"].includes(req.user.role))
    return next(new AppError("You cant", 403));

  const delivery = await Deliveries.findOne({
    where: { uuid: req.params.uuid },
  });
  if (!delivery) return next(new AppError("Delivery not found", 404));

  await delivery.update(req.body);

  return res.status(200).send(delivery);
});

exports.deleteDelivery = catchAsync(async (req, res, next) => {
  if (["operator", "stock_operator"].includes(req.user.role))
    return next(new AppError("You cant", 403));

  const delivery = await Deliveries.findOne({
    where: { uuid: req.params.uuid },
  });
  if (!delivery) return next(new AppError("Delivery not found", 404));

  await delivery.destroy();

  return res.status(200).json({ msg: "Delivery Successfully Deleted" });
});
