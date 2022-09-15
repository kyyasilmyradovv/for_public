const bcrypt = require("bcryptjs");
const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
const { Users, Orders } = require("../../models");

exports.getMe = catchAsync(async (req, res) => {
  return res.status(200).json({
    id: req.user.id,
    name: req.user.name,
    phone: req.user.phone,
    email: req.user.email,
    promos: req.user.promos,
    isSupplier: req.user.isSupplier,
  });
});

exports.updateMe = catchAsync(async (req, res) => {
  const { name, email, device_token } = req.body;
  const user = await Users.findOne({ where: { uuid: req.user.uuid } });

  await user.update({ name, email, device_token });
  res.status(200).json({ msg: "Successfully Updated" });
});

exports.updateMyPassword = catchAsync(async (req, res, next) => {
  const { password, newPassword } = req.body;
  if (!password || !newPassword)
    return next(new AppError("Invalid Credentials", 400));

  const user = await Users.findOne({ where: { uuid: req.user.uuid } });

  if (!(await bcrypt.compare(password, user.password)))
    return next(new AppError("Password is wrong", 401));

  await user.update({ password: await bcrypt.hash(newPassword, 12) });

  res.status(200).json({ msg: "Successfully Updated" });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  const user = await Users.findOne({
    where: { uuid: req.user.uuid },
    include: {
      model: Orders,
      as: "user_orders",
      where: { status: ["accepted", "pending", "sent"] },
      required: false,
    },
  });
  if (user.user_orders.length > 0 || user.isSupplier)
    return next(new AppError("undelivered orders/Supplier", 400));

  await user.update({ phone: null, isBlocked: true });

  res.status(200).json({ msg: "Successfully Deleted" });
});
