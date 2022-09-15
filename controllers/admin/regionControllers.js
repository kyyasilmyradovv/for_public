const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
const { Regions, Carriers } = require("../../models");

exports.getAllRegions = catchAsync(async (req, res) => {
  const { limit, offset, cityId } = req.query;
  let where = {};
  if (cityId) where.cityId = cityId;

  const { count, rows } = await Regions.findAndCountAll({
    where,
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

exports.getRegion = catchAsync(async (req, res) => {
  const region = await Regions.findOne({
    where: { uuid: req.params.uuid },
    include: {
      model: Carriers,
      as: "carriers",
    },
  });
  return res.status(200).send(region);
});

exports.addRegion = catchAsync(async (req, res, next) => {
  if (["operator", "stock_operator"].includes(req.user.role))
    return next(new AppError("You cant", 403));
  const newRegion = await Regions.create(req.body);
  return res.status(200).send(newRegion);
});

exports.editRegion = catchAsync(async (req, res, next) => {
  if (["operator", "stock_operator"].includes(req.user.role))
    return next(new AppError("You cant", 403));

  const region = await Regions.findOne({ where: { uuid: req.params.uuid } });
  if (!region) return next(new AppError("Region not found", 404));

  await region.update(req.body);

  return res.status(200).send(region);
});

exports.deleteRegion = catchAsync(async (req, res, next) => {
  if (["operator", "stock_operator"].includes(req.user.role))
    return next(new AppError("You cant", 403));

  const region = await Regions.findOne({
    where: { uuid: req.params.uuid },
    include: { model: Carriers, as: "carriers" },
  });

  if (!region) return next(new AppError("Region not found", 404));
  if (region.carriers.length > 0)
    return next(
      new AppError("Region has associations, cannot be deleted", 400)
    );

  await region.destroy();

  return res.status(200).json({ msg: "Region Successfully Deleted" });
});
