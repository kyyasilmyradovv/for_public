const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { Wholesalers } = require("../../models");
const { createSendToken } = require("./../../utils/createSendToken");
const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");

exports.login = catchAsync(async (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return next(new AppError("Please provide username and password", 400));
  }

  const wholesaler = await Wholesalers.findOne({
    where: { username, isBlocked: false },
  });
  if (!wholesaler || !(await bcrypt.compare(password, wholesaler.password))) {
    return next(new AppError("Incorrect username or password", 401));
  }

  createSendToken(wholesaler, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) return next(new AppError("You are not logged in", 401));

  const decoded = await promisify(jwt.verify)(
    token,
    "gdfgdfggggggggggggg@FSd6$"
  );
  const freshUser = await Carriers.findOne({
    where: { uuid: [decoded.id], isBlocked: false },
  });
  if (!freshUser) {
    return next(
      new AppError(
        "The user belonging to this token is no longer exists or blocked",
        401
      )
    );
  }

  req.user = freshUser;
  next();
});
