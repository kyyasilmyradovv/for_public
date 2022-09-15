const { Op } = require("sequelize");
const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
const { send_notification } = require("../../utils/send_notification");
const {
  Products,
  Orders,
  Orderproducts,
  Ordercollections,
  Discounts,
  Productimages,
  Deliveries,
  Collections,
  Addresses,
  Regions,
  Promos,
  Categories,
  Users,
  Cities,
  Admins,
} = require("../../models");
const { order_atts } = require("../../utils/attributes");

exports.addMyOrders = catchAsync(async (req, res, next) => {
  var {
    cityId,
    address_uuid,
    new_address,
    deliveryId,
    delivery_time,
    payment_type,
    items,
    promo_code,
  } = req.body;
  if (!cityId || !delivery_time || !payment_type || !items || items.length == 0)
    return next(new AppError("Invalid Credentials", 400));
  const city = await Cities.findOne({ where: { id: cityId } });
  const delivery = await Deliveries.findOne({ where: { id: deliveryId } });
  if (address_uuid) {
    var address = await Addresses.findOne({ where: { uuid: address_uuid } });
  } else if (new_address.full && new_address.regionId) {
    var address = await Addresses.create({
      ...new_address,
      userId: req.user.id,
    });
  }
  const region = await Regions.findOne({ where: { id: address.regionId } });
  if (promo_code) {
    var promo = await Promos.findOne({
      where: { code: promo_code, dep_type: ["both", "market"], isActive: true },
    });
    if (promo && promo.use_max) {
      var count = 0;
      req.user.promos.forEach((e) => {
        if (e == promo.id) count++;
      });
      if (count >= promo.use_max) return next(new AppError("You used", 400));
    }
  }
  if ((promo_code && !promo) || !city || !delivery || !address)
    return next(new AppError("Invalid Credentials", 400));

  let total_price = 0,
    order_items = [];
  for (item of items) {
    if (item.type == "product") {
      var cp = await Products.findOne({
        where: {
          uuid: item.uuid,
          isActive: true,
          type: ["both", "market"],
          unordered: { [Op.gte]: item.quantity },
        },
        include: [
          {
            model: Categories,
            as: "categories",
            attributes: ["id"],
          },
          {
            model: Discounts,
            as: "discount",
            where: { dep_type: ["both", "market"], isActive: true },
            required: false,
          },
        ],
      });
    } else if (item.type == "collection") {
      var cp = await Collections.findOne({
        where: {
          uuid: item.uuid,
          isActive: true,
          type: ["both", "market"],
          unordered: { [Op.gte]: item.quantity },
        },
        include: {
          model: Discounts,
          as: "discount",
          where: { dep_type: ["both", "market"], isActive: true },
          required: false,
        },
      });
    }
    if (!cp) return next(new AppError("Some Item/s not found/enough", 404));

    if (promo && !cp.discount) {
      if (item.type == "product") {
        if (promo.child_type == "all") {
          cp.discount = { type: "promo", amount: promo.percent };
        } else if (promo.child_type == "products") {
          if (promo.child_ids.includes(cp.id)) {
            cp.discount = { type: "promo", amount: promo.percent };
          }
        } else if (promo.child_type == "brand") {
          if (promo.child_ids.includes(cp.brandId))
            cp.discount = { type: "promo", amount: promo.percent };
        } else if (promo.child_type == "category") {
          let a = false;
          cp.categories.forEach((e) => {
            if (e.id == promo.child_ids[0]) a = true;
          });
          if (a) cp.discount = { type: "promo", amount: promo.percent };
        }
      } else if (item.type == "collection") {
        if (promo.child_type == "all") {
          cp.discount = { type: "promo", amount: promo.percent };
        } else if (promo.child_type == "collections") {
          if (promo.child_ids.includes(cp.id))
            cp.discount = { type: "promo", amount: promo.percent };
        }
      }
      if (cp.discount)
        cp.price = ((cp.price * (100 - cp.discount.amount)) / 100).toFixed(2);
    }

    var item_total_price =
      cp.discount != null && cp.discount.type == "bonused"
        ? cp.price * item.quantity -
          cp.price *
            Math.trunc(
              item.quantity / (cp.discount.required + cp.discount.bonus)
            ) *
            cp.discount.bonus
        : cp.price * item.quantity;

    order_items.push({
      price: cp.price,
      total_price: item_total_price,
      discount_type: cp.discount != null ? cp.discount.type : null,
      discount_amount: cp.discount != null ? cp.discount.amount : null,
      discount_required: cp.discount != null ? cp.discount.required : null,
      discount_bonus: cp.discount != null ? cp.discount.bonus : null,
      quantity: item.quantity,
    });
    if (item.type == "product") {
      order_items[order_items.length - 1].productId = cp.id;
    } else if (item.type == "collection") {
      order_items[order_items.length - 1].collectionId = cp.id;
    }
    total_price += item_total_price;
  }

  const newOrder = await Orders.create({
    code: city.code,
    payment_type,
    total_price: total_price + delivery.price,
    user_name: req.user.name,
    user_phone: req.user.phone,
    address: region.name_tm + ", " + address.full + ", " + city.name_tm,
    delivery_code: delivery.code,
    delivery_type: delivery.type,
    delivery_cost: delivery.price,
    delivery_time,
    userId: req.user.id,
  });

  for (item of order_items) {
    if (item.productId) {
      await Orderproducts.create({ ...item, orderId: newOrder.id });
    } else if (item.collectionId) {
      await Ordercollections.create({ ...item, orderId: newOrder.id });
    }
  }

  if (promo && promo.use_max)
    await Users.update(
      { promos: [...req.user.promos, promo.id] },
      { where: { uuid: req.user.uuid } }
    );

  // Sending Notifications to Admins
  const admins = await Admins.findAll({
    where: { role: { [Op.not]: "stock_operator" } },
  });
  var registration_ids = [];
  for (admin of admins) {
    if (admin.device_token != null) registration_ids.push(admin.device_token);
  }
  if (registration_ids.length > 0)
    send_notification({
      notification: {
        title: "New Order",
        body: "We have a new Order",
      },
      registration_ids,
    });

  return res.status(200).json({ msg: "ordered" });
});

exports.addMyExpressOrders = catchAsync(async (req, res, next) => {
  var { cityId, address_uuid, payment_type, items, promo_code } = req.body;
  if (!cityId || !address_uuid || !payment_type || !items || items.length == 0)
    return next(new AppError("Invalid Credentials", 400));
  const city = await Cities.findOne({ where: { id: cityId } });
  const address = await Addresses.findOne({
    where: { uuid: address_uuid },
    include: {
      model: Regions,
      as: "region",
      where: { isExpress: true },
    },
  });
  if (promo_code) {
    var promo = await Promos.findOne({
      where: {
        code: promo_code,
        dep_type: ["both", "express"],
        isActive: true,
      },
    });
    if (promo && promo.use_max) {
      var count = 0;
      req.user.promos.forEach((e) => {
        if (e == promo.id) count++;
      });
      if (count >= promo.use_max) return next(new AppError("You used", 400));
    }
  }
  const delivery = await Deliveries.findOne({ where: { type: "express" } });
  if (!city || !address || (promo_code && !promo))
    return next(new AppError("Invalid Credentials", 400));

  let total_price = 0,
    order_items = [];
  for (item of items) {
    if (item.type == "product") {
      var cp = await Products.findOne({
        where: {
          uuid: item.uuid,
          isActive: true,
          type: ["both", "express"],
          in_carrier_stock: { [Op.gte]: item.quantity },
          express_max: { [Op.gte]: item.quantity },
        },
        include: [
          {
            model: Categories,
            as: "categories",
            attributes: ["id"],
          },
          {
            model: Discounts,
            as: "discount",
            where: { dep_type: ["both", "express"], isActive: true },
            required: false,
          },
        ],
      });
    } else if (item.type == "collection") {
      var cp = await Collections.findOne({
        where: {
          uuid: item.uuid,
          isActive: true,
          type: ["both", "express"],
          in_carrier_stock: { [Op.gte]: item.quantity },
          express_max: { [Op.gte]: item.quantity },
        },
        include: {
          model: Discounts,
          as: "discount",
          where: { dep_type: ["both", "express"], isActive: true },
          required: false,
        },
      });
    }
    if (!cp) return next(new AppError(`Something not found/enough`, 404));

    if (promo && !cp.discount) {
      if (item.type == "product") {
        if (promo.child_type == "all") {
          cp.discount = { type: "promo", amount: promo.percent };
        } else if (promo.child_type == "products") {
          if (promo.child_ids.includes(cp.id))
            cp.discount = { type: "promo", amount: promo.percent };
        } else if (promo.child_type == "brand") {
          if (promo.child_ids.includes(cp.brandId))
            cp.discount = { type: "promo", amount: promo.percent };
        } else if (promo.child_type == "category") {
          let a = false;
          cp.categories.forEach((e) => {
            if (e.id == promo.child_ids[0]) a = true;
          });
          if (a) cp.discount = { type: "promo", amount: promo.percent };
        }
      } else if (item.type == "collection") {
        if (promo.child_type == "all") {
          cp.discount = { type: "promo", amount: promo.percent };
        } else if (promo.child_type == "collections") {
          if (promo.child_ids.includes(cp.id))
            cp.discount = { type: "promo", amount: promo.percent };
        }
      }
      if (cp.discount)
        cp.price_express = (
          (cp.price_express * (100 - cp.discount.amount)) /
          100
        ).toFixed(2);
    }

    var item_total_price =
      cp.discount != null && cp.discount.type == "bonused"
        ? cp.price_express * item.quantity -
          cp.price_express *
            Math.trunc(
              item.quantity / (cp.discount.required + cp.discount.bonus)
            ) *
            cp.discount.bonus
        : cp.price_express * item.quantity;

    order_items.push({
      price: cp.price_express,
      total_price: item_total_price,
      discount_type: cp.discount != null ? cp.discount.type : null,
      discount_amount: cp.discount != null ? cp.discount.amount : null,
      discount_required: cp.discount != null ? cp.discount.required : null,
      discount_bonus: cp.discount != null ? cp.discount.bonus : null,
      quantity: item.quantity,
    });
    if (item.type == "product") {
      order_items[order_items.length - 1].productId = cp.id;
    } else if (item.type == "collection") {
      order_items[order_items.length - 1].collectionId = cp.id;
    }
    total_price += item_total_price;
  }

  const newOrder = await Orders.create({
    code: city.code,
    payment_type,
    total_price: total_price + delivery.price,
    user_name: req.user.name,
    user_phone: req.user.phone,
    address: address.region.name_tm + ", " + address.full + ", " + city.name_tm,
    delivery_code: delivery.code,
    delivery_type: "express",
    delivery_cost: delivery.price,
    status: "accepted",
    userId: req.user.id,
  });

  for (item of order_items) {
    if (item.productId) {
      await Orderproducts.create({ ...item, orderId: newOrder.id });
    } else if (item.collectionId) {
      await Ordercollections.create({ ...item, orderId: newOrder.id });
    }
  }

  if (promo && promo.use_max)
    await Users.update(
      { promos: [...req.user.promos, promo.id] },
      { where: { uuid: req.user.uuid } }
    );

  return res.status(200).json({ msg: "ordered" });
});

exports.getMyOrders = catchAsync(async (req, res, next) => {
  let limit = req.query.limit || 20,
    offset = req.query.offset || 0;
  let { count, rows } = await Orders.findAndCountAll({
    where: { userId: req.user.id },
    include: [
      {
        model: Products,
        as: "order_products",
        attributes: ["id"],
        include: {
          model: Productimages,
          as: "product_images",
          limit: 1,
        },
      },
      {
        model: Collections,
        as: "order_collections",
        attributes: ["id"],
        include: {
          model: Productimages,
          as: "images",
          limit: 1,
        },
      },
    ],
    order: [["id", "DESC"]],
    attributes: order_atts,
    limit,
    offset,
    distinct: true,
  });

  for (order of rows) {
    let images = [];
    for (product of order.order_products) {
      if (product.product_images.length > 0)
        images.push({
          type: "product",
          uuid: product.product_images[0].uuid,
        });
      if (images.length == 3) break;
    }
    if (images.length < 3) {
      for (collection of order.order_collections) {
        images.push({
          type: "collection",
          uuid: collection.images[0].uuid,
        });
        if (images.length == 3) break;
      }
    }
    order.dataValues.images = images;
    delete order.dataValues.order_products;
    delete order.dataValues.order_collections;
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

exports.getMyOrderProducts = catchAsync(async (req, res, next) => {
  const order = await Orders.findOne({
    where: { uuid: req.params.uuid },
    attributes: order_atts,
    include: [
      {
        model: Products,
        as: "order_products",
        attributes: ["id", "uuid", "name_tm", "name_ru", "name_en"],
        include: {
          model: Productimages,
          as: "product_images",
          limit: 1,
        },
      },
      {
        model: Collections,
        as: "order_collections",
        attributes: ["id", "uuid", "name_tm", "name_ru", "name_en"],
        include: [
          {
            model: Productimages,
            as: "images",
            limit: 1,
          },
          {
            model: Products,
            as: "collection_products",
            attributes: ["id", "uuid", "name_tm", "name_ru", "name_en"],
            include: {
              model: Productimages,
              as: "product_images",
              limit: 1,
            },
          },
        ],
      },
    ],
  });
  if (!order) return next(new AppError(`Order not found`, 404));

  res.status(200).send(order);
});

exports.editMyOrder = catchAsync(async (req, res, next) => {
  const order = await Orders.findOne({ where: { uuid: req.params.uuid } });
  if (!order) return next(new AppError("Order not found", 404));

  var { status, rating, comment_by_user } = req.body;
  if (status == "rejected" && order.status == "pending") {
    await order.update({ status: "rejected", actionAt: Date.now() });
    const user = await Users.findOne({
      where: { id: order.userId },
    });
    await user.update({
      orders_rejected: user.orders_rejected + 1,
    });
  }

  if (
    rating &&
    comment_by_user &&
    ["delivered", "not_delivered", "rejected"].includes(order.status)
  ) {
    await order.update({ rating, comment_by_user });
  }

  return res.status(200).json({ msg: "updated" });
});

exports.checkMyPromo = catchAsync(async (req, res, next) => {
  const promo = await Promos.findOne({
    where: {
      code: req.body.code,
      dep_type: ["both", req.body.dep_type],
      isActive: true,
    },
    attributes: ["id", "uuid", "percent", "child_type", "child_ids", "use_max"],
  });
  if (!promo) return next(new AppError("Wrong Promo", 404));

  if (promo.use_max) {
    var count = 0;
    if (req.user.promos) for (e of req.user.promos) if (e == promo.id) count++;
    if (count >= promo.use_max) return next(new AppError("You used", 400));
  }

  return res.status(200).send(promo);
});
