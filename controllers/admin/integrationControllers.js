const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const catchAsync = require("../../utils/catchAsync");
const {
  Categories,
  Brands,
  Products,
  Discounts,
  Deliveries,
  Orders,
  Worders,
  Collections,
  Collectionproducts,
  Users,
  Wholesalers,
  Carriers,
  Productcategories,
} = require("../../models");

exports.protectIntegration = catchAsync(async (req, res, next) => {
  const decoded = await promisify(jwt.verify)(
    req.body.token,
    "s$%$ndgbdfsdbdfdbdefvdv__"
  );

  if (
    decoded.id ==
    "wrtegfntgdbnvbgr3edfb325464#$%$#$%^%$#$^%$%^%$%^%$"
  )
    next();
});

exports.syncCategories = catchAsync(async (req, res) => {
  for (category of req.body.categories) {
    let parentId = null;
    if (category.CODE.length > 6) {
      parentId = (
        await Categories.findOne({
          where: { code: category.CODE.slice(0, category.CODE.length - 3) },
          attributes: ["id"],
        })
      ).id;
    }
    await Categories.findOrCreate({
      where: { code: category.CODE },
      defaults: {
        code: category.CODE,
        name_ru: category.NAME,
        parentId,
      },
    });
  }
  for (category of req.body.subcategories) {
    let parentId = (
      await Categories.findOne({
        where: { code: category.CODE.slice(0, category.CODE.length - 3) },
        attributes: ["id"],
      })
    ).id;
    await Categories.findOrCreate({
      where: { code: category.CODE },
      defaults: {
        code: category.CODE,
        name_ru: category.NAME,
        isLeaf: true,
        parentId,
      },
    });
  }
  for (brand of req.body.brands) {
    await Brands.findOrCreate({
      where: { code: brand.BRANDREF.toString() },
      defaults: {
        code: brand.BRANDREF,
        name_tm: brand.BRANDNAME,
      },
    });
  }

  return res.status(200).json({ msg: "Categories Synced" });
});

exports.syncClients = catchAsync(async (req, res) => {
  for (supplier of req.body.suppliers) {
    const user = await Users.findOne({
      where: { phone: [supplier.PHONE_NUMBER, supplier.PHONE_NUMBER.slice(4)] },
    });
    if (user) {
      console.log("found");
      await user.update({
        code: supplier.CLIENTREF,
        isSupplier: true,
        company_name: supplier.DEFINITION_,
      });
    }
  }
  for (wholesaler of req.body.wholesalers) {
    await Wholesalers.findOrCreate({
      where: { code: wholesaler.CLIENTREF.toString() },
      defaults: {
        code: wholesaler.CLIENTREF.toString(),
        name: wholesaler.DEFINITION_,
        phone: wholesaler.PHONE_NUMBER,
      },
    });
  }
  for (carrier of req.body.carriers) {
    await Carriers.findOrCreate({
      where: { code: carrier.CLIENTREF.toString() },
      defaults: {
        code: carrier.CLIENTREF.toString(),
        name: carrier.DEFINITION_,
        phone: carrier.PHONE_NUMBER,
      },
    });
  }

  return res.status(200).json({ msg: "Successfully Added" });
});

exports.syncItems = catchAsync(async (req, res) => {
  for (product of req.body.products) {
    const {
      ITMREF,
      ITMCODE,
      BARCODE,
      SHELF_CODE,
      ITMNAME,
      AMOUNT,
      PRICE,
      MINPRICE,
      CLIENTREF,
      BRANDREF,
      ITEMTYPE,
      DISCTYPE,
    } = product;

    var categoryId = null,
      supplierId = null,
      brandId = null;
    const category = await Categories.findOne({
      where: { code: ITMCODE.slice(0, ITMCODE.length - 4) },
    });
    if (category) categoryId = category.id;
    if (CLIENTREF != null) {
      const supp = await Users.findOne({
        where: { code: CLIENTREF.toString() },
      });
      if (supp) supplierId = supp.id;
    }
    if (BRANDREF != null) {
      const brand = await Brands.findOne({
        where: { code: BRANDREF.toString() },
      });
      if (brand) brandId = brand.id;
    }

    if (BARCODE) {
      const [prod, created] = await Products.findOrCreate({
        where: { bar_code: BARCODE },
        defaults: {
          code: ITMREF.toString(),
          bar_code: BARCODE,
          shelf_code: SHELF_CODE,
          name_tm: ITMNAME,
          price: MINPRICE,
          given_price: PRICE,
          stock_quantity: AMOUNT,
          type: ITEMTYPE.toLowerCase(),
          brandId,
          supplierId,
        },
      });
      if (created) {
        if (categoryId != null) {
          await Productcategories.create({ categoryId, productId: prod.id });
        }
        if (DISCTYPE) {
          await Discounts.create({
            type: "price",
            amount: PRICE - MINPRICE,
            dep_type: DISCTYPE,
            productId: prod.id,
          });
        }
      } else {
        await prod.update({
          shelf_code: SHELF_CODE,
          price: MINPRICE,
          given_price: PRICE,
          stock_quantity: AMOUNT,
          supplierId,
        });
        if (DISCTYPE) {
          const discount = await Discounts.findOne({
            where: { productId: prod.id },
          });
          if (discount) {
            await discount.update({
              amount: PRICE - MINPRICE,
              dep_type: DISCTYPE,
            });
          } else {
            await Discounts.create({
              type: "price",
              amount: PRICE - MINPRICE,
              dep_type: DISCTYPE,
              productId: prod.id,
            });
          }
        }
      }
    } else if (ITMREF) {
      const [prod, created] = await Products.findOrCreate({
        where: { code: ITMREF.toString() },
        defaults: {
          code: ITMREF.toString(),
          bar_code: BARCODE,
          shelf_code: SHELF_CODE,
          name_tm: ITMNAME,
          price: MINPRICE,
          given_price: PRICE,
          stock_quantity: AMOUNT,
          type: ITEMTYPE.toLowerCase(),
          brandId,
          supplierId,
        },
      });
      if (!created) {
        await prod.update({
          bar_code: BARCODE,
          shelf_code: SHELF_CODE,
          price: MINPRICE,
          given_price: PRICE,
          stock_quantity: AMOUNT,
          supplierId,
        });
        if (DISCTYPE) {
          const discount = await Discounts.findOne({
            where: { productId: prod.id },
          });
          if (discount) {
            await discount.update({
              amount: PRICE - MINPRICE,
              dep_type: DISCTYPE,
            });
          } else {
            await Discounts.create({
              type: "price",
              amount: PRICE - MINPRICE,
              dep_type: DISCTYPE,
              productId: prod.id,
            });
          }
        }
      }
    }
  }

  for (collection of req.body.collections) {
    if (collection.BARCODE) {
      const [col, created] = await Collections.findOrCreate({
        where: { bar_code: collection.BARCODE },
        defaults: {
          code: collection.ITMREF.toString(),
          bar_code: collection.BARCODE,
          shelf_code: collection.SHELF_CODE,
          name_tm: collection.ITMNAME,
          price: collection.MINPRICE,
          given_price: collection.PRICE,
          type: collection.ITEMTYPE.toLowerCase(),
          stock_quantity: collection.AMOUNT,
        },
      });
      if (!created)
        await col.update({
          shelf_code: collection.SHELF_CODE,
          stock_quantity: collection.AMOUNT,
          price: collection.MINPRICE,
          given_price: collection.PRICE,
        });
      if (collection.DISCTYPE) {
        const discount = await Discounts.findOne({
          where: { collectionId: col.id },
        });
        if (discount) {
          await discount.update({
            amount: PRICE - MINPRICE,
            dep_type: DISCTYPE,
          });
        } else {
          await Discounts.create({
            type: "price",
            amount: PRICE - MINPRICE,
            dep_type: DISCTYPE,
            collectionId: col.id,
          });
        }
      }
      for (product of collection.products) {
        const prod = await Products.findOne({
          where: { code: product.STCREF.toString() },
          attributes: ["id"],
        });
        await Collectionproducts.findOrCreate({
          where: { productId: prod.id, collectionId: col.id },
          defaults: {
            quantity: product.AMNT,
            productId: prod.id,
            collectionId: col.id,
          },
        });
      }
    } else if (collection.ITMREF) {
      const col = await Collections.findOne({
        where: { code: collection.ITMREF.toString() },
      });
      if (col)
        await col.update({
          bar_code: collection.BAR_CODE,
          shelf_code: collection.SHELF_CODE,
          stock_quantity: collection.AMOUNT,
          price: collection.MINPRICE,
          given_price: collection.PRICE,
        });
    }
  }

  for (del of req.body.deliveries) {
    if (del.ITMNAME == "Standart Dostawka") {
      const delivery = await Deliveries.findOne({
        where: { type: "market" },
      });
      if (delivery) {
        await delivery.update({ price: del.PRICE });
      } else {
        await Deliveries.create({
          code: del.ITMREF,
          title_tm: "Standart Dostawka",
          type: "market",
          price: del.PRICE,
        });
      }
    } else if (del.ITMNAME == "Express Dostawka") {
      const delivery = await Deliveries.findOne({
        where: { type: "express" },
      });
      if (delivery) {
        await delivery.update({ price: del.PRICE });
      } else {
        await Deliveries.create({
          code: del.ITMREF,
          title_tm: "Express Dostawka",
          type: "express",
          price: del.PRICE,
        });
      }
    } else {
      const delivery = await Deliveries.findOne({
        where: { title_tm: del.ITMNAME },
      });
      if (delivery) {
        await delivery.update({ price: del.PRICE });
      } else {
        await Deliveries.create({ title_tm: del.ITMNAME, price: del.PRICE });
      }
    }
  }

  return res.status(200).json({ msg: "Items Successfully Synced" });
});

exports.getSyncOrders = catchAsync(async (req, res) => {
  const orders = await Orders.findAll({
    where: { status: "delivered", isSynced: false },
    attributes: ["uuid", "code", "actionAt", "delivery_code", "delivery_cost"],
    include: [
      {
        model: Products,
        as: "order_products",
        attributes: ["code"],
      },
      {
        model: Collections,
        as: "order_collections",
        attributes: ["code"],
      },
      {
        model: Carriers,
        as: "carrier",
        attributes: ["code"],
      },
    ],
  });

  const worders = await Worders.findAll({
    where: { isSynced: false, status: "delivered" },
    attributes: ["uuid", "code", "actionAt"],
    include: [
      {
        model: Products,
        as: "worder_products",
        attributes: ["code"],
      },
      {
        model: Wholesalers,
        as: "wholesaler",
        attributes: ["code"],
      },
    ],
  });

  return res.status(200).send({ orders, worders });
});

exports.syncOrder = catchAsync(async (req, res) => {
  let order;
  if (req.body.code[0] == "U") {
    order = await Orders.findOne({ where: { uuid: req.body.uuid } });
  } else if (req.body.code[0] == "W") {
    order = await Worders.findOne({ where: { uuid: req.body.uuid } });
  }

  await order.update({ isSynced: true });
  return res.status(200).json({ msg: "Order Synced" });
});
