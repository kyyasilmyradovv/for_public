const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
const { Promos, Users } = require("../../models");

exports.getAllPromos = catchAsync(async (req, res, next) => {
  if (req.user.role == "stock_operator")
    return next(new AppError("You cant", 403));
  const promos = await Promos.findAll();
  return res.status(200).send(promos);
});

exports.addPromo = catchAsync(async (req, res, next) => {
  if (["operator", "stock_operator"].includes(req.user.role))
    return next(new AppError("You cant", 403));
  const newPromo = await Promos.create(req.body);
  return res.status(200).send(newPromo);
});

exports.editPromo = catchAsync(async (req, res, next) => {
  if (["operator", "stock_operator"].includes(req.user.role))
    return next(new AppError("You cant", 403));

  const promo = await Promos.findOne({ where: { uuid: req.params.uuid } });
  if (!promo) return next(new AppError("Promo not found", 404));

  await promo.update(req.body);

  if (req.body.isActive == false) {
    const users = await Users.findAll();
    for (user of users) {
      user.promos = user.promos.filter((e) => {
        return e != promo.id;
      });
      await user.save();
    }
  }

  return res.status(200).send(promo);
});

exports.deletePromo = catchAsync(async (req, res, next) => {
  if (["operator", "stock_operator"].includes(req.user.role))
    return next(new AppError("You cant", 403));

  const promo = await Promos.findOne({ where: { uuid: req.params.uuid } });
  if (!promo) return next(new AppError("Promo not found", 404));

  await promo.destroy();

  return res.status(200).json({ msg: "Promo Successfully Deleted" });
});
