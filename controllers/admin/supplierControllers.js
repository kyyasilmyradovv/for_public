const bcrypt = require("bcryptjs");
const Op = require("sequelize").Op;
const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
const { sendEmail } = require("./../../utils/email");
const { send_notification } = require("../../utils/send_notification");
const {
  Users,
  Supplierorders,
  Soproducts,
  Products,
  Productimages,
  Mobiles,
  sequelize,
} = require("../../models");

exports.getAllSuppliers = catchAsync(async (req, res) => {
  const { limit, offset } = req.query;
  const { count, rows } = await Users.findAndCountAll({
    where: { isSupplier: true },
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

exports.getSupplier = catchAsync(async (req, res, next) => {
  const supplier = await Users.findOne({
    where: { uuid: req.params.uuid },
    include: {
      model: Products,
      as: "supplier_products",
      include: {
        model: Productimages,
        as: "product_images",
      },
    },
  });
  if (!supplier) return next(new AppError("Supplier not found", 404));
  return res.status(200).send(supplier);
});

exports.getSupplierOrders = catchAsync(async (req, res) => {
  const { limit, offset, supplierId, code, status, from, until } = req.query;
  let where = {};
  if (supplierId) where.supplierId = supplierId;
  if (code) where.code = code;
  if (status) where.status = status;
  if (from)
    where.updatedAt = {
      [Op.gte]: from,
      [Op.lt]: until,
    };

  const { count, rows } = await Supplierorders.findAndCountAll({
    where,
    include: [
      {
        model: Users,
        as: "supplier",
        attributes: ["id", "uuid", "name", "phone", "company_name"],
      },
      {
        model: Products,
        as: "supplierorder_products",
        attributes: ["code", "bar_code", "name_tm", "name_ru", "name_en"],
      },
    ],
    order: [["id", "DESC"]],
    limit,
    offset,
    distinct: true,
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

exports.getOrderProducts = catchAsync(async (req, res) => {
  const order = await Supplierorders.findOne({
    where: { id: req.query.supplierorderId },
    include: [
      {
        model: Users,
        as: "supplier",
        attributes: ["name", "company_name"],
      },
      {
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
        include: {
          model: Productimages,
          as: "product_images",
        },
      },
    ],
  });

  return res.status(200).send(order);
});

exports.addOrder = catchAsync(async (req, res) => {
  const newOrder = await Supplierorders.create(req.body);

  for (p of req.body.products) {
    await Soproducts.create({
      quantity: p.quantity,
      productId: p.id,
      supplierorderId: newOrder.id,
    });
  }

  const supplier = await Users.findOne({
    where: { id: req.body.supplierId },
  });

  const options = {
    from: `Täze Sargyt <globalmailerr@gmail.com>`,
    to: supplier.email,
    subject: "Täze sargyt",
    text: `Globaldan -${
      newOrder.code
    }- belgili täze sargyt gelip gowuşdy. Sargyt bilen platforma arkaly tanyş bolmagyňyzy haýyş edýäris.\n\nSargydyň eltilmeli senesi: ${newOrder.delivery_time
      .toString()
      .slice(0, 10)}\n\nHormatlamak bilen Global Administratsiýasy!`,
  };

  // await sendEmail(options);

  // Sending SMS about Order
  const sender = await Mobiles.findOne({ order: sequelize.random() });
  // send_notification({
  //   notification: {
  //     title: supplier.phone,
  //     body: `SetMarketden ${newOrder.code}- belgili täze sargyt gelip gowuşdy`,
  //   },
  //   registration_ids: [sender.device_token],
  // });

  return res.status(201).send(newOrder);
});

exports.editOrder = catchAsync(async (req, res, next) => {
  const order = await Supplierorders.findOne({
    where: { uuid: req.params.uuid },
  });
  if (!order) return next(new AppError("Order not found", 404));

  await order.update(req.body);

  return res.status(200).send(order);
});

exports.deleteOrderProduct = catchAsync(async (req, res, next) => {
  const orderProduct = await Soproducts.findOne({
    where: { uuid: req.params.uuid },
  });
  if (!orderProduct) return next(new AppError("Order Product not found", 404));

  await orderProduct.destroy();

  return res.status(200).json({
    msg: "Order Product was Successfully Deleted",
  });
});
