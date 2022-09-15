const Op = require("sequelize").Op;
const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
const { send_notification } = require("../../utils/send_notification");
const {
  Orders,
  Orderproducts,
  Ordercollections,
  Carrierproducts,
  Carriercollections,
  Products,
  Productimages,
  Carriers,
  Collections,
  Users,
  Discounts,
} = require("../../models");

exports.getAllOrders = catchAsync(async (req, res) => {
  let { limit, offset, user_phone, code, status, delivery_type, from, until } =
    req.query;
  let where = {};
  if (user_phone) where.user_phone = { [Op.like]: "%" + user_phone + "%" };
  if (code) where.code = { [Op.like]: "%" + code.toUpperCase() + "%" };
  if (status) where.status = status;
  if (delivery_type) where.delivery_type = delivery_type;
  if (from)
    where.createdAt = {
      [Op.gte]: from,
    };
  if (until)
    where.createdAt = {
      ...where.createdAt,
      [Op.lt]: until,
    };

  const { count, rows } = await Orders.findAndCountAll({
    where,
    order: [["id", "desc"]],
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

exports.getOrderProducts = catchAsync(async (req, res, next) => {
  const order = await Orders.findOne({
    where: { uuid: req.params.uuid },
    include: [
      {
        model: Products,
        as: "order_products",
        attributes: [
          "code",
          "bar_code",
          "shelf_code",
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
      {
        model: Collections,
        as: "order_collections",
        attributes: [
          "code",
          "bar_code",
          "shelf_code",
          "name_tm",
          "name_ru",
          "name_en",
          "description_tm",
          "description_ru",
          "description_en",
        ],
        include: {
          model: Productimages,
          as: "images",
        },
      },
    ],
  });
  if (!order) return next(new AppError("Order not found", 404));

  return res.status(201).send(order);
});

exports.editOrder = catchAsync(async (req, res, next) => {
  if (req.user.role == "stock_operator")
    return next(new AppError("You cant", 403));
  const order = await Orders.findOne({
    where: { uuid: req.params.uuid },
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

  const user = await Users.findOne({
    where: { id: order.userId },
  });

  if (req.body.status == "accepted") {
    if (order.status == "accepted")
      return next(new AppError("Order Already Accepted", 400));
    order.order_products.forEach(async (p) => {
      const product = await Products.findOne({ where: { uuid: p.uuid } });
      await product.update({
        ordered: product.ordered + p.Orderproducts.quantity,
      });
    });
    order.order_collections.forEach(async (c) => {
      const collection = await Collections.findOne({ where: { uuid: c.uuid } });
      await collection.update({
        ordered: collection.ordered + c.Ordercollections.quantity,
      });
    });
  } else if (req.body.status == "sent") {
    if (order.status == "sent")
      return next(new AppError("Order Already Sent", 400));
    var carrier = await Carriers.findOne({ where: { id: req.body.carrierId } });
    await carrier.update({ tasks_today: carrier.tasks_today + 1 });
    if (order.delivery_type == "express") {
      for (p of order.order_products) {
        const product = await Carrierproducts.findOne({
          where: { productId: p.id, carrierId: req.body.carrierId },
        });
        if (!product)
          return next(new AppError("Cannot attach to that carrier", 400));
      }
      for (c of order.order_collections) {
        const collection = await Carriercollections.findOne({
          where: { collectionId: c.id, carrierId: req.body.carrierId },
        });
        if (!collection)
          return next(new AppError("Cannot attach to that carrier", 400));
      }
      order.order_products.forEach(async (p) => {
        const product = await Carrierproducts.findOne({
          where: { productId: p.id, carrierId: req.body.carrierId },
        });
        await product.update({
          stock_quantity: product.stock_quantity - p.Orderproducts.quantity,
        });
      });
      order.order_collections.forEach(async (c) => {
        const collection = await Carriercollections.findOne({
          where: { collectionId: c.id, carrierId: req.body.carrierId },
        });
        await collection.update({
          stock_quantity:
            collection.stock_quantity - c.Ordercollections.quantity,
        });
      });
    }
  } else if (req.body.status == "delivered") {
    if (order.status == "delivered")
      return next(new AppError("Order Already Delivered", 400));
    if (order.payment_type == "cash") {
      const carrier = await Carriers.findOne({
        where: { id: order.carrierId },
      });
      await carrier.update({ cash: carrier.cash + order.total_price });
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
        const collection = await Collections.findOne({
          where: { uuid: c.uuid },
        });
        await collection.update({
          ordered: collection.ordered - c.Ordercollections.quantity,
          stock_quantity:
            collection.stock_quantity - c.Ordercollections.quantity,
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
  } else if (req.body.status == "rejected") {
    if (order.status == "rejected")
      return next(new AppError("Order Already Rejected", 400));
    await user.update({ orders_rejected: user.orders_rejected + 1 });
  } else if (req.body.status == "not_delivered") {
    if (order.status == "not_delivered")
      return next(new AppError("Order Already Not_Delivered", 400));
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
  }
  req.body.actionAt = new Date();

  await order.update(req.body);

  if (req.body.status == "accepted" && user.device_token != null) {
    send_notification({
      notification: {
        title: "Order Accepted",
        text: `Dear User, your order with code: ${order.code} is accepted and will be delivered`,
      },
      registration_ids: [user.device_token],
    });
  } else if (req.body.status == "sent" && carrier.device_token != null) {
    send_notification({
      notification: {
        title: "New Order",
        body: "Dear Courier you have a new order to deliver",
      },
      registration_ids: [carrier.device_token],
    });
  }

  return res.status(200).send(order);
});

exports.removeItem = catchAsync(async (req, res, next) => {
  if (req.user.role == "stock_operator")
    return next(new AppError("You cant", 403));

  const { type, uuid } = req.body;
  if (type == "product") {
    var item = await Orderproducts.findOne({ where: { uuid } });
    var product = await Products.findOne({ where: { id: item.productId } });
    await product.update({ ordered: product.ordered - item.quantity });
  } else if (type == "collection") {
    var item = await Ordercollections.findOne({ where: { uuid } });
    var collection = await Collections.findOne({
      where: { id: item.collectionId },
    });
    await collection.update({ ordered: collection.ordered - item.quantity });
  }
  if (!item) return next(new AppError("Item not found", 404));

  const order = await Orders.findOne({ where: { id: item.orderId } });
  await order.update({ total_price: order.total_price - item.total_price });

  await item.destroy();

  return res.status(200).json({ msg: "Item Successfully Removed" });
});

exports.addItem = catchAsync(async (req, res, next) => {
  if (req.user.role == "stock_operator")
    return next(new AppError("You cant", 403));

  const { order_uuid, type, uuid, quantity } = req.body;
  const order = await Orders.findOne({
    where: {
      uuid: order_uuid,
      delivery_type: "market",
      status: ["pending", "accepted"],
    },
  });
  if (!order) return next(new AppError("Order not found", 404));

  if (type == "product") {
    var item = await Products.findOne({
      where: {
        uuid,
        type: ["both", "market"],
        unordered: { [Op.gte]: quantity },
        isActive: true,
      },
      include: {
        model: Discounts,
        as: "discount",
        where: { dep_type: ["both", "market"], isActive: true },
        required: false,
      },
    });
  } else if (type == "collection") {
    var item = await Collections.findOne({
      where: {
        uuid,
        type: ["both", "market"],
        unordered: { [Op.gte]: quantity },
        isActive: true,
      },
      include: {
        model: Discounts,
        as: "discount",
        where: { dep_type: ["both", "market"], isActive: true },
        required: false,
      },
    });
  }
  if (!order || !item) return next(new AppError("Order/Item not found", 404));

  var order_item = {
    price: item.price,
    total_price:
      item.discount != null && item.discount.type == "bonused"
        ? item.price * quantity -
          item.price *
            Math.trunc(
              quantity / (item.discount.required + item.discount.bonus)
            ) *
            item.discount.bonus
        : item.price * quantity,
    discount_type: item.discount != null ? item.discount.type : null,
    discount_amount: item.discount != null ? item.discount.amount : null,
    discount_required: item.discount != null ? item.discount.required : null,
    discount_bonus: item.discount != null ? item.discount.bonus : null,
    quantity: quantity,
    orderId: order.id,
  };

  if (type == "product") {
    await Orderproducts.create({ ...order_item, productId: item.id });
  } else if (type == "collection") {
    await Ordercollections.create({ ...order_item, collectionId: item.id });
  }

  await item.update({ ordered: item.ordered + quantity });
  await order.update({
    total_price: order.total_price + order_item.total_price,
  });

  return res.status(200).send(order);
});
