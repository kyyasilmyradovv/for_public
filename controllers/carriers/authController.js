const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { Carriers, Regions } = require("../../models");
const { createSendToken } = require("./../../utils/createSendToken");
const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");

exports.login = catchAsync(async (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password)
    return next(new AppError("Provide username/pass", 400));

  const carrier = await Carriers.findOne({
    where: { username, isBlocked: false },
  });
  if (!carrier || !(await bcrypt.compare(password, carrier.password)))
    return next(new AppError("Incorrect username or password", 401));

  createSendToken(carrier, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token,
    auth = req.headers.authorization;
  if (auth && auth.startsWith("Bearer")) token = auth.split(" ")[1];
  if (!token) return next(new AppError("You are not logged in", 401));

  const decoded = await promisify(jwt.verify)(
    token,
    "DRKY234567890-9876543245678976543ewqCn2BuxQK4@FSd6$"
  );
  const freshUser = await Carriers.findOne({
    where: { uuid: [decoded.id], isBlocked: false },
  });
  if (!freshUser) return next(new AppError("No User/Blocked", 401));

  req.user = freshUser;
  next();
});

exports.getMe = catchAsync(async (req, res) => {
  const carrier = await Carriers.findOne({
    where: { id: req.user.id },
    include: { model: Regions, as: "carrier_regions" },
  });
  res.status(200).json({ you: carrier });
});

exports.updateMyDeviceToken = catchAsync(async (req, res) => {
  const carrier = await Carriers.findOne({ where: { uuid: req.user.uuid } });
  await carrier.update({ device_token: req.body.device_token });
  res.status(200).json({ msg: "Successfully Updated" });
});
