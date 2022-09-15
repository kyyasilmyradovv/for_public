const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
const { Addresses, Regions, Cities } = require("../../models");

exports.addAddress = catchAsync(async (req, res, next) => {
  const { count } = await Addresses.findAndCountAll({
    where: { userId: req.user.id },
  });
  if (count >= 5) return next(new AppError("You cannot add more than 5", 400));

  req.body.userId = req.user.id;
  const newAddress = await Addresses.create(req.body);

  return res.status(200).send(newAddress);
});

exports.getMyAddresses = catchAsync(async (req, res) => {
  const addresses = await Addresses.findAll({
    where: { userId: req.user.id },
    attributes: ["uuid", "full"],
    include: {
      model: Regions,
      as: "region",
      include: {
        model: Cities,
        as: "city",
      },
    },
  });

  res.status(200).json(addresses);
});

exports.editMyAddress = catchAsync(async (req, res, next) => {
  const address = await Addresses.findOne({ where: { uuid: req.params.uuid } });
  if (!address) return next(new AppError("Address not found", 404));

  await address.update({ full: req.body.full, regionId: req.body.regionId });

  res.status(200).json({ msg: "Updated" });
});

exports.deleteMyAddress = catchAsync(async (req, res, next) => {
  const address = await Addresses.findOne({ where: { uuid: req.params.uuid } });
  if (!address) return next(new AppError("Address not found", 404));

  await address.destroy();

  res.status(200).json({ msg: "Successfully Deleted" });
});
