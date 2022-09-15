const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
const { Supplierorders, Soproducts, Products } = require("../../models");

exports.getMyOrders = catchAsync(async (req, res) => {
  const { limit, offset } = req.query;
  const { count, rows } = await Supplierorders.findAndCountAll({
    where: { supplierId: req.user.id },
    order: [["id", "DESC"]],
    include: {
      model: Products,
      as: "supplierorder_products",
      attributes: ["id"],
      through: { attributes: [] },
    },
    limit,
    offset,
    distinct: true,
  });

  for (i of rows) {
    i.dataValues.items_count = i.supplierorder_products.length;
    delete i.dataValues.supplierorder_products;
  }

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

exports.getOrderProducts = catchAsync(async (req, res, next) => {
  const order = await Supplierorders.findOne({
    where: { uuid: req.params.uuid },
    include: {
      model: Products,
      as: "supplierorder_products",
      attributes: [
        "code",
        "bar_code",
        "name_tm",
        "name_ru",
        "name_en",
        "description_tm",
        "description_ru",
        "description_en",
        "weight",
        "volume",
      ],
    },
  });
  if (!order) return next(new AppError("Order not found", 404));

  return res.status(200).json({ products: order.supplierorder_products });
});

exports.editOrder = catchAsync(async (req, res, next) => {
  const { status, products } = req.body;
  if (!["accepted", "rejected"].includes(status))
    return next(new AppError("Invalid status", 400));

  const order = await Supplierorders.findOne({
    where: { uuid: req.params.uuid, status: "pending" },
  });
  if (!order) return next(new AppError("Order not found", 404));
  await order.update({ status });

  if (status == "accepted")
    for (p of products) {
      const soproduct = await Soproducts.findOne({ where: { uuid: p.uuid } });
      await soproduct.update({ supplied_quantity: p.supplied_quantity });
    }

  return res.status(200).json({ msg: "Edited" });
});
