const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
const { Mobiles } = require("../../models");

exports.getAllMobiles = catchAsync(async (req, res, next) => {
  if (["operator", "stock_operator"].includes(req.user.role))
    return next(new AppError("You cant", 403));
  const mobiles = await Mobiles.findAll();
  return res.status(200).send(mobiles);
});

exports.deleteMobile = catchAsync(async (req, res, next) => {
  if (["operator", "stock_operator"].includes(req.user.role))
    return next(new AppError("You cant", 403));
  const sender = await Mobiles.findOne({ where: { id: req.params.id } });
  if (!sender) return next(new AppError("Not found", 404));

  await sender.destroy();
  return res.status(200).json({ msg: "Successfully Deleted" });
});
