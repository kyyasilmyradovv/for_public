const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
const { Faqs } = require("../../models");

exports.getAllFaqs = catchAsync(async (req, res, next) => {
  if (req.user.role == "stock_operator")
    return next(new AppError("You cant", 403));
  const faqs = await Faqs.findAll();
  return res.status(200).send(faqs);
});

exports.addFaq = catchAsync(async (req, res, next) => {
  if (req.user.role == "stock_operator")
    return next(new AppError("You cant", 403));
  const newFaq = await Faqs.create(req.body);
  return res.status(200).send(newFaq);
});

exports.editFaq = catchAsync(async (req, res, next) => {
  if (req.user.role == "stock_operator")
    return next(new AppError("You cant", 403));

  const faq = await Faqs.findOne({ where: { uuid: req.params.uuid } });
  if (!faq) return next(new AppError("Faq not found", 404));

  await faq.update(req.body);

  return res.status(200).send(faq);
});

exports.deleteFaq = catchAsync(async (req, res, next) => {
  if (req.user.role == "stock_operator")
    return next(new AppError("You cant", 403));

  const faq = await Faqs.findOne({ where: { uuid: req.params.uuid } });
  if (!faq) return next(new AppError("Faq not found", 404));

  await faq.destroy();

  return res.status(200).json({ msg: "Faq Successfully Deleted" });
});
