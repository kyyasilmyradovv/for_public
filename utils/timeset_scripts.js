const Op = require("sequelize").Op;
const {
  Discounts,
  Users,
  Orders,
  Worders,
  Stats,
  Promos,
  Products,
  Collections,
} = require("../models");

exports.timeset_scripts = async () => {
  // Delete Expired Discounts
  var expired_discounts = await Discounts.findAll({
    where: {
      isActive: true,
      to: { [Op.lte]: Date.now() },
    },
  });

  for (d of expired_discounts) {
    if (d.productId) {
      var cp = await Products.findOne({ where: { id: d.productId } });
    } else if (d.collectionId) {
      var cp = await Collections.findOne({ where: { id: d.collectionId } });
    }
    if (cp) {
      if (d.dep_type == "both") {
        cp.price = cp.given_price;
        cp.price_express = cp.given_price;
      } else if (d.dep_type == "market") {
        cp.price = cp.given_price;
      } else if (d.dep_type == "express") {
        cp.price_express = cp.given_price;
      }
      await cp.save();
    }
    await d.destroy();
  }

  // Activate Discounts
  var discounts = await Discounts.findAll({
    where: {
      isActive: false,
      from: { [Op.lte]: Date.now() },
    },
  });

  for (d of discounts) {
    if (d.productId) {
      var cp = await Products.findOne({ where: { id: d.productId } });
    } else if (d.collectionId) {
      var cp = await Collections.findOne({ where: { id: d.collectionId } });
    }
    if (cp) {
      var amount = d.amount;
      if (d.type == "percentage") amount = (100 - amount) / 100;
      if (d.dep_type == "both") {
        if (d.type == "percentage") {
          cp.price = (cp.given_price * amount).toFixed(2);
          cp.price_express = (cp.given_price * amount).toFixed(2);
        } else if (d.type == "price") {
          cp.price = cp.given_price - amount;
          cp.price_express = cp.given_price - amount;
        }
      } else if (d.dep_type == "market") {
        if (d.type == "percentage") {
          cp.price = (cp.given_price * amount).toFixed(2);
        } else if (d.type == "price") {
          cp.price = cp.given_price - amount;
        }
      } else if (d.dep_type == "express") {
        if (d.type == "percentage") {
          cp.price_express = (cp.given_price * amount).toFixed(2);
        } else if (d.type == "price") {
          cp.price_express = cp.given_price - amount;
        }
      }
      await cp.save();
    }
    await d.update({ isActive: true });
  }

  // User sms_code
  var time = new Date();
  time.setMinutes(time.getMinutes() - 3, 0, 0);
  await Users.update(
    { sms_code: null },
    {
      where: {
        sms_code: { [Op.not]: null },
        updatedAt: { [Op.lte]: time },
      },
    }
  );

  // Stats
  var month_start = new Date(),
    month_end = new Date(),
    month = {
      year: month_start.getFullYear(),
      month: month_start.getMonth(),
    },
    statuses = ["delivered", "not_delivered", "rejected"],
    times = ["actionAt", "actionAt", "actionAt"],
    types = ["order", "worder"];
  month_start.setHours(0, 0, 0, 0);
  month_start.setDate(1);
  month_end.setHours(0, 0, 0, 0);
  month_end.setDate(1);
  month_end.setMonth(month_end.getMonth() + 1);

  for (type of types) {
    month.type = type;
    var model = type == "order" ? Orders : Worders;
    month.income = (
      await model.sum("total_price", {
        where: {
          status: "delivered",
          actionAt: { [Op.between]: [month_start, month_end] },
        },
      })
    ).toFixed(2);
    month.all = (
      await model.findAndCountAll({
        where: { createdAt: { [Op.between]: [month_start, month_end] } },
      })
    ).count;
    for (var i = 0; i < statuses.length; i++) {
      month[statuses[i]] = (
        await model.findAndCountAll({
          where: {
            [times[i]]: { [Op.between]: [month_start, month_end] },
            status: statuses[i],
          },
        })
      ).count;
    }

    var stat = await Stats.findOne({
      where: { type, year: month.year, month: month.month },
    });
    stat ? await stat.update(month) : (stat = await Stats.create(month));
  }

  const { count } = await Users.findAndCountAll({
    where: { createdAt: { [Op.between]: [month_start, month_end] } },
    attributes: ["id"],
  });
  var stat = await Stats.findOne({
    where: { type: "users", year: month.year, month: month.month },
  });
  stat
    ? await stat.update({ all: count })
    : (stat = await Stats.create({
        type: "users",
        year: month.year,
        month: month.month,
        all: count,
      }));

  // // Promos
  await Promos.update(
    { isActive: false, from: null, to: null },
    { where: { isActive: true, to: { [Op.lte]: Date.now() } } }
  );
  await Promos.update(
    { isActive: true },
    { where: { isActive: false, from: { [Op.lte]: Date.now() } } }
  );
  // Collections
  await Collections.update(
    { isActive: false, from: null, to: null },
    { where: { isActive: true, to: { [Op.lte]: Date.now() } } }
  );
};
