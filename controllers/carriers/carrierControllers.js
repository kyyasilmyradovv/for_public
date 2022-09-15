const { Op } = require("sequelize");
const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
const {
  Carriers,
  Orders,
  Worders,
  Wholesalers,
  Productimages,
  Products,
  Collections,
  Carriercollections,
  Carrierproducts,
  Users,
} = require("../../models");
const { item_atts_for_carrier, order_atts } = require("../../utils/attributes");

exports.getMyItems = catchAsync(async (req, res) => {
  const carrier = await Carriers.findOne({
    where: { id: req.user.id },
    include: [
      {
        model: Products,
        as: "products",
        attributes: item_atts_for_carrier,
        include: {
          model: Productimages,
          as: "product_images",
        },
      },
      {
        model: Collections,
        as: "collections",
        attributes: item_atts_for_carrier,
      },
    ],
  });

  return res.status(200).json({
    products: carrier.products,
    collections: carrier.collections,
  });
});

exports.getNewExpressOrders = catchAsync(async (req, res) => {
  let { limit, offset, code, region_names } = req.query,
    where = { status: "accepted", delivery_type: "express" };
  if (code) where.code = { [Op.like]: "%" + code + "%" };
  if (region_names) where.address = { [Op.like]: { [Op.any]: region_names } };

  const { count, rows } = await Orders.findAndCountAll({
    where,
    attributes: order_atts,
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

exports.getMyOrders = catchAsync(async (req, res) => {
  let { limit, offset, code } = req.query,
    where = { carrierId: req.user.id };
  if (code) where.code = { [Op.like]: "%" + code + "%" };
  const { count, rows } = await Orders.findAndCountAll({
    where,
    attributes: order_atts,
    order: [["id", "DESC"]],
    limit,
    offset,
  });

  const sent_count = await Orders.count({
    where: { carrierId: req.user.id, status: "sent" },
  });
  const delivered_count = await Orders.count({
    where: { carrierId: req.user.id, status: "delivered" },
  });
  const not_delivered_count = await Orders.count({
    where: { carrierId: req.user.id, status: "not_delivered" },
  });

  return res.status(200).json({
    pagination: {
      all: count,
      limit,
      current_page: Math.floor(offset / limit) + 1,
      next: count - offset > limit,
      sent_count,
      delivered_count,
      not_delivered_count,
    },
    data: rows,
  });
});

exports.getMyWorders = catchAsync(async (req, res, next) => {
  let where = { carrierId: req.user.id },
    limit = req.query.limit || 20,
    offset = req.query.offset || 0;
  if (req.query.code) where.code = { [Op.like]: "%" + req.query.code + "%" };
  const { count, rows } = await Worders.findAndCountAll({
    where,
    attributes: [
      "uuid",
      "code",
      "total_price",
      "payment_type",
      "address",
      "delivery_time",
      "status",
      "note",
    ],
    include: {
      model: Wholesalers,
      as: "wholesaler",
      attributes: ["phone"],
    },
    order: [["id", "DESC"]],
    limit,
    offset,
    distinct: true,
  });

  const sent_count = await Worders.count({
    where: { carrierId: req.user.id, status: "sent" },
  });
  const delivered_count = await Worders.count({
    where: { carrierId: req.user.id, status: "delivered" },
  });
  const not_delivered_count = await Worders.count({
    where: { carrierId: req.user.id, status: "not_delivered" },
  });

  return res.status(200).json({
    pagination: {
      all: count,
      limit,
      current_page: Math.floor(offset / limit) + 1,
      next: count - offset > limit,
      sent_count,
      delivered_count,
      not_delivered_count,
    },
    data: rows,
  });
});

exports.editOrder = catchAsync(async (req, res, next) => {
  var { status } = req.body,
    where = { uuid: req.params.uuid };
  if (status == "sent") {
    where.status = "accepted";
    where.delivery_type = "express";
  } else if (["delivered", "not_delivered"].includes(status)) {
    where.status = "sent";
    where.carrierId = req.user.id;
  } else {
    return next(new AppError("Invalid Status", 400));
  }

  const order = await Orders.findOne({
    where,
    include: [
      {
        model: Products,
        as: "order_products",
        attributes: ["uuid", "id"],
      },
      {
        model: Collections,
        as: "order_collections",
        attributes: ["uuid", "id"],
      },
    ],
  });
  if (!order) return next(new AppError("Order not found", 404));

  const user = await Users.findOne({ where: { id: order.userId } });

  if (status == "delivered") {
    if (order.payment_type == "cash") {
      const me = await Carriers.findOne({ where: { uuid: req.user.uuid } });
      await me.update({ cash: me.cash + order.total_price });
    }
    await user.update({ orders_delivered: user.orders_delivered + 1 });
    if (order.delivery_type != "express") {
      order.order_products.forEach(async (p) => {
        const product = await Products.findOne({ where: { uuid: p.uuid } });
        await product.update({
          ordered: product.ordered - p.Orderproducts.quantity,
          stock_quantity: product.stock_quantity - p.Orderproducts.quantity,
        });
      });
      order.order_collections.forEach(async (c) => {
        const col = await Collections.findOne({ where: { uuid: c.uuid } });
        await col.update({
          ordered: col.ordered - c.Ordercollections.quantity,
          stock_quantity: col.stock_quantity - c.Ordercollections.quantity,
        });
      });
    } else if (order.delivery_type == "express") {
      order.order_products.forEach(async (p) => {
        const product = await Products.findOne({ where: { uuid: p.uuid } });
        await product.update({
          in_carrier_stock: product.in_carrier_stock - p.Orderproducts.quantity,
          stock_quantity: product.stock_quantity - p.Orderproducts.quantity,
        });
      });
      order.order_collections.forEach(async (c) => {
        const col = await Collections.findOne({ where: { uuid: c.uuid } });
        await col.update({
          in_carrier_stock: col.in_carrier_stock - c.Ordercollections.quantity,
          stock_quantity: col.stock_quantity - c.Ordercollections.quantity,
        });
      });
    }
  } else if (status == "not_delivered") {
    await user.update({ orders_rejected: user.orders_rejected + 1 });
    if (order.delivery_type != "express") {
      order.order_products.forEach(async (p) => {
        const product = await Products.findOne({ where: { uuid: p.uuid } });
        await product.update({
          ordered: product.ordered - p.Orderproducts.quantity,
        });
      });
      order.order_collections.forEach(async (c) => {
        const col = await Collections.findOne({ where: { uuid: c.uuid } });
        await col.update({
          ordered: col.ordered - c.Ordercollections.quantity,
        });
      });
    } else if (order.delivery_type == "express") {
      order.order_products.forEach(async (p) => {
        const product = await Carrierproducts.findOne({
          where: { productId: p.id, carrierId: order.carrierId },
        });
        await product.update({
          stock_quantity: product.stock_quantity + p.Orderproducts.quantity,
        });
      });
      order.order_collections.forEach(async (c) => {
        const collection = await Carriercollections.findOne({
          where: { collectionId: c.id, carrierId: order.carrierId },
        });
        await collection.update({
          stock_quantity:
            collection.stock_quantity + c.Ordercollections.quantity,
        });
      });
    }
  } else if (status == "sent") {
    const me = await Carriers.findOne({ where: { uuid: req.user.uuid } });
    await me.update({ tasks_today: me.tasks_today + 1 });
    req.body.carrierId = me.id;
    order.order_products.forEach(async (p) => {
      const product = await Carrierproducts.findOne({
        where: { productId: p.id, carrierId: req.user.id },
      });
      await product.update({
        stock_quantity: product.stock_quantity - p.Orderproducts.quantity,
      });
    });
    order.order_collections.forEach(async (c) => {
      const collection = await Carriercollections.findOne({
        where: { collectionId: c.id, carrierId: req.user.id },
      });
      await collection.update({
        stock_quantity: collection.stock_quantity - c.Ordercollections.quantity,
      });
    });
  }

  req.body.actionAt = new Date();
  await order.update(req.body);

  return res.status(200).json({ msg: "Successfully updated" });
});

exports.editWorder = catchAsync(async (req, res, next) => {
  const worder = await Worders.findOne({
    where: { uuid: req.params.uuid, carrierId: req.user.id },
  });
  if (!worder) return next(new AppError("Order not found", 404));

  await worder.update({
    note: req.body.note,
    status: req.body.status,
  });

  return res.status(200).json({ msg: "Successfully updated" });
});

exports.getOrderItems = catchAsync(async (req, res, next) => {
  const order = await Orders.findOne({
    where: { uuid: req.params.uuid },
    include: [
      {
        model: Products,
        as: "order_products",
        attributes: item_atts_for_carrier,
        include: {
          model: Productimages,
          as: "product_images",
        },
      },
      {
        model: Collections,
        as: "order_collections",
        attributes: item_atts_for_carrier,
        include: {
          model: Productimages,
          as: "images",
        },
      },
    ],
  });
  if (!order) return next(new AppError("Order not found", 404));

  return res.status(200).send(order);
});

exports.getWorderItems = catchAsync(async (req, res, next) => {
  const worder = await Worders.findOne({
    where: { uuid: req.params.uuid },
    include: {
      model: Products,
      as: "worder_products",
      attributes: item_atts_for_carrier,
      include: {
        model: Productimages,
        as: "product_images",
      },
    },
  });
  if (!worder) return next(new AppError("Worder not found", 404));

  return res.status(200).json({ products: worder.worder_products });
});
