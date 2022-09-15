const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const {
  Users,
  Addresses,
  Regions,
  Mobiles,
  sequelize,
} = require("../../models");
const { createSendToken } = require("./../../utils/createSendToken");
const { send_notification } = require("../../utils/send_notification");
const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");

exports.protect = catchAsync(async (req, res, next) => {
  let token,
    auth = req.headers.authorization;
  if (auth && auth.startsWith("Bearer")) token = auth.split(" ")[1];
  if (!token) return next(new AppError("You are not logged in", 401));

  const decoded = await promisify(jwt.verify)(
    token,
    "Ddsfdsssssssss23o3qCn2BuxQK4@FSd6$"
  );

  const freshUser = await Users.findOne({
    where: { uuid: decoded.id, isBlocked: false },
  });
  if (!freshUser) return next(new AppError("User no longer exists", 401));

  req.user = freshUser;
  next();
});

exports.expressProtect = catchAsync(async (req, res, next) => {
  let token,
    auth = req.headers.authorization;
  if (auth && auth.startsWith("Bearer")) token = auth.split(" ")[1];
  if (!token) return next(new AppError("You are not logged in", 401));

  const decoded = await promisify(jwt.verify)(
    token,
    "DRKYx$asdadfsdfsdfsdfsdfsdfsd3BuxQK4@FSd6$"
  );

  const freshUser = await Users.findOne({
    where: { uuid: decoded.id, isBlocked: false },
    include: {
      model: Addresses,
      as: "addresses",
      attributes: ["regionId"],
    },
  });
  if (!freshUser) return next(new AppError("User no longer exists", 401));

  let hasExpress = false;
  for (address of freshUser.addresses) {
    const region = await Regions.findOne({
      where: { id: address.regionId, isExpress: true },
    });
    if (region) hasExpress = true;
  }
  if (!hasExpress) return next(new AppError("Ur adresses r not express", 400));

  req.user = freshUser;
  next();
});

exports.sendMeCode = catchAsync(async (req, res, next) => {
  const { phone } = req.body;
  if (!phone || phone.length != 8) return next(new AppError("Inv. num", 400));
  const sms_code = String(Math.floor(10000 + Math.random() * 90000));

  var user = await Users.findOne({ where: { phone, isVerified: true } });
  if (user) return next(new AppError("U`ve already registered as user", 400));

  var user = await Users.findOne({ where: { phone } });
  if (user) {
    await user.update({ sms_code });
  } else {
    await Users.create({ phone, sms_code });
  }

  const sender = await Mobiles.findOne({ order: sequelize.random() });
  send_notification({
    notification: {
      title: phone,
      body: "Magnit Market tassyklaýyş koduňyz: " + sms_code,
    },
    registration_ids: [sender.device_token],
  });

  res.status(200).json({ msg: "Successfully Sent" });
});

exports.sendMeCodeForRecovery = catchAsync(async (req, res, next) => {
  const { phone } = req.body;
  if (!phone || phone.length != 8) return next(new AppError("Inv. num", 400));
  const sms_code = String(Math.floor(10000 + Math.random() * 90000));

  const user = await Users.findOne({ where: { phone, isVerified: true } });
  if (!user) return next(new AppError("U`ve not registered yet", 400));
  await user.update({ sms_code });

  const sender = await Mobiles.findOne({ order: sequelize.random() });
  send_notification({
    notification: {
      title: phone,
      body: "Magnit Market tassyklaýyş koduňyz: " + sms_code,
    },
    registration_ids: [sender.device_token],
  });

  res.status(200).json({ msg: "Successfully Sent" });
});

exports.verifyMyCode = catchAsync(async (req, res, next) => {
  const { phone, sms_code } = req.body;
  const user = await Users.findOne({ where: { phone, sms_code } });
  if (!user) return next(new AppError("Wrong Code/Phone Provided", 400));

  await user.update({ isVerified: true, sms_code: null });

  createSendToken(user, 201, res);
});

exports.signup = catchAsync(async (req, res, next) => {
  const user = await Users.findOne({ where: { uuid: req.user.uuid } });
  if (!user) return next(new AppError("Do not try to hack:)", 404));

  var { name, email, password } = req.body;
  if (password) password = await bcrypt.hash(password, 12);

  await user.update({ name, email, password });

  res.status(201).send({
    id: user.id,
    name: user.name,
    phone: user.phone,
    email: user.email,
    promos: user.promos,
    isSupplier: user.isSupplier,
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { phone, password } = req.body;
  if (!phone || !password) return next(new AppError("Provide phone/pass", 400));

  const user = await Users.findOne({ where: { phone, isBlocked: false } });

  if (!user || !(await bcrypt.compare(password, user.password)))
    return next(new AppError("Incorrect phone or password", 401));

  createSendToken(user, 200, res);
});
