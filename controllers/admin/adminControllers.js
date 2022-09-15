const bcrypt = require("bcryptjs");
const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
const { Admins } = require("../../models");

exports.getAllAdmins = catchAsync(async (req, res, next) => {
  if (req.user.role != "superadmin") return next(new AppError("You cant", 403));
  const { limit, offset } = req.query;
  const { count, rows } = await Admins.findAndCountAll({
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

exports.getAdmin = catchAsync(async (req, res, next) => {
  if (req.user.role != "superadmin") return next(new AppError("You cant", 403));
  const admin = await Admins.findOne({ where: { uuid: req.params.uuid } });
  return res.status(200).send(admin);
});

exports.addAdmin = catchAsync(async (req, res, next) => {
  if (req.user.role != "superadmin") return next(new AppError("You cant", 403));
  const newAdmin = await Admins.create(req.body);
  return res.status(200).send(newAdmin);
});

exports.editAdmin = catchAsync(async (req, res, next) => {
  if (req.user.role != "superadmin") return next(new AppError("You cant", 403));
  const admin = await Admins.findOne({ where: { uuid: req.params.uuid } });
  if (!admin) return next(new AppError("Admin not found", 404));

  if (req.body.password)
    req.body.password = await bcrypt.hash(req.body.password, 12);
  await admin.update(req.body);

  return res.status(200).send(admin);
});

exports.deleteAdmin = catchAsync(async (req, res, next) => {
  if (req.user.role != "superadmin") return next(new AppError("You cant", 403));
  const admin = await Admins.findOne({ where: { uuid: req.params.uuid } });
  if (!admin) return next(new AppError("Admin not found", 404));

  await admin.destroy();

  return res.status(200).json({ msg: "Admin Successfully Deleted" });
});

exports.updateMyDeviceToken = catchAsync(async (req, res) => {
  const admin = await Admins.findOne({ where: { uuid: req.user.uuid } });
  await admin.update({ device_token: req.body.device_token });
  res.status(200).json({ msg: "Successfully Updated" });
});
