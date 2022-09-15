const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { promisify } = require("util");
const { createSendToken } = require("../../utils/createSendToken");
const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
const { Admins } = require("../../models");

exports.getMe = catchAsync(async (req, res) => {
  res.status(200).json({ you: req.user });
});

exports.login = catchAsync(async (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password)
    return next(new AppError("Provide username/pass", 400));
  const admin = await Admins.findOne({ where: { username, isBlocked: false } });

  if (!admin || !(await bcrypt.compare(password, admin.password)))
    return next(new AppError("Incorrect username or password", 401));

  createSendToken(admin, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token,
    auth = req.headers.authorization;
  if (auth && auth.startsWith("Bearer")) token = auth.split(" ")[1];
  if (!token) return next(new AppError("You are not logged in", 401));

  const decoded = await promisify(jwt.verify)(
    token,
    "DRKYx$LSRXasfdsgdhjuiopuddasdrtyuiytgfdsadfghjk324567ytgf#yo3qCn2BuxQK4@FSd6$"
  );

  const freshAdmin = await Admins.findOne({
    where: { uuid: decoded.id, isBlocked: false },
  });
  if (!freshAdmin) return next(new AppError("User no longer exists", 401));

  req.user = freshAdmin;
  next();
});
