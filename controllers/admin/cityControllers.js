const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
const { Regions, Cities } = require("../../models");

exports.getAllCities = catchAsync(async (req, res) => {
  const cities = await Cities.findAll({
    include: { model: Regions, as: "regions" },
  });
  return res.status(200).send(cities);
});

exports.getCity = catchAsync(async (req, res) => {
  const city = await Cities.findOne({
    where: { uuid: req.params.uuid },
    include: { model: Regions, as: "regions" },
  });
  return res.status(200).send(city);
});

exports.addCity = catchAsync(async (req, res) => {
  if (["operator", "stock_operator"].includes(req.user.role))
    return next(new AppError("You cant", 403));
  const newCity = await Cities.create(req.body);
  return res.status(200).send(newCity);
});

exports.editCity = catchAsync(async (req, res, next) => {
  if (["operator", "stock_operator"].includes(req.user.role))
    return next(new AppError("You cant", 403));

  const city = await Cities.findOne({ where: { uuid: req.params.uuid } });
  if (!city) return next(new AppError("City not found", 404));

  await city.update(req.body);

  return res.status(200).send(city);
});

exports.deleteCity = catchAsync(async (req, res, next) => {
  if (["operator", "stock_operator"].includes(req.user.role))
    return next(new AppError("You cant", 403));

  const city = await Cities.findOne({
    where: { uuid: req.params.uuid },
    include: { model: Regions, as: "regions" },
  });
  if (!city) return next(new AppError("City not found", 404));
  if (city.regions.length > 0)
    return next(new AppError("City has regions, cannot be deleted", 400));

  await city.destroy();

  return res.status(200).json({ msg: "City Successfully Deleted" });
});
