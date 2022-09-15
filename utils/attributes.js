const {
  Categories,
  Brands,
  Productimages,
  Discounts,
  Products,
  Collections,
} = require("../models");
const { Op } = require("sequelize");
exports.banner_atts = ["uuid", "url", "child_type", "childId"];
exports.product_atts_few = [
  "id",
  "uuid",
  "name_tm",
  "name_ru",
  "name_en",
  "price",
  "given_price",
  "price_express",
  "express_max",
  "isNew",
  "isHit",
  "isEnoughInStock",
];
exports.product_atts_more = [
  "id",
  "uuid",
  "code",
  "bar_code",
  "name_tm",
  "name_ru",
  "name_en",
  "description_tm",
  "description_ru",
  "description_en",
  "price",
  "given_price",
  "price_express",
  "express_max",
  "weight",
  "volume",
  "likes",
  "isNew",
  "isHit",
];
exports.collection_atts = [
  "id",
  "uuid",
  "name_tm",
  "name_ru",
  "name_en",
  "price",
  "given_price",
  "price_express",
  "express_max",
  "from",
  "to",
  "isEnoughInStock",
  "isNew",
  "isHit",
];
exports.collection_atts_more = [
  "id",
  "uuid",
  "code",
  "bar_code",
  "name_tm",
  "name_ru",
  "name_en",
  "description_tm",
  "description_ru",
  "description_en",
  "price",
  "given_price",
  "price_express",
  "express_max",
  "likes",
  "from",
  "to",
  "isNew",
  "isHit",
];
exports.category_atts = [
  "id",
  "uuid",
  "name_tm",
  "name_ru",
  "name_en",
  "priority",
];
exports.brand_atts = ["id", "uuid", "name_tm", "name_ru", "name_en"];
exports.discount_atts = [
  "id",
  "uuid",
  "type",
  "amount",
  "required",
  "bonus",
  "from",
  "to",
  "dep_type",
];
exports.campaign_atts = [
  "id",
  "uuid",
  "title_tm",
  "title_ru",
  "title_en",
  "brandId",
  "categoryId",
];

exports.product_includes = () => {
  return [
    {
      model: Categories,
      as: "categories",
      attributes: ["id", "uuid", "name_tm", "name_ru", "name_en"],
      through: { attributes: [] },
      include: {
        model: Categories,
        as: "category_parent",
        attributes: ["id", "uuid", "name_tm", "name_ru", "name_en"],
        include: {
          model: Categories,
          as: "category_parent",
          attributes: ["id", "uuid", "name_tm", "name_ru", "name_en"],
        },
      },
    },
    {
      model: Brands,
      as: "brand",
      attributes: ["id", "uuid", "name_tm", "name_ru", "name_en"],
    },
    {
      model: Productimages,
      as: "product_images",
    },
    {
      model: Discounts,
      as: "discount",
      attributes: this.discount_atts,
      where: { isActive: true },
      required: false,
    },
  ];
};

exports.product_includes_for_cart = (dep_type) => {
  return [
    {
      model: Categories,
      as: "categories",
      attributes: ["id"],
      through: { attributes: [] },
    },
    {
      model: Brands,
      as: "brand",
      attributes: ["id", "uuid", "name_tm", "name_ru", "name_en"],
    },
    {
      model: Productimages,
      as: "product_images",
      limit: 1,
    },
    {
      model: Discounts,
      as: "discount",
      attributes: this.discount_atts,
      where: { dep_type, isActive: true },
      required: false,
    },
  ];
};

exports.product_includes_for_admin = (required) => {
  return [
    {
      model: Categories,
      as: "categories",
      attributes: ["id", "uuid", "name_tm", "name_ru", "name_en"],
    },
    {
      model: Brands,
      as: "brand",
      attributes: ["id", "uuid", "name_tm", "name_ru", "name_en"],
    },
    {
      model: Productimages,
      as: "product_images",
    },
    {
      model: Discounts,
      as: "discount",
      attributes: this.discount_atts,
      required,
    },
  ];
};

exports.product_includes_imd = (dep_type) => {
  return [
    {
      model: Productimages,
      as: "product_images",
      limit: 1,
    },
    {
      model: Discounts,
      as: "discount",
      attributes: this.discount_atts,
      where: { dep_type, isActive: true },
      required: false,
    },
  ];
};

exports.product_includes_for_price_range = (cat_where, dis_where, required) => {
  return [
    {
      model: Categories,
      as: "categories",
      where: cat_where,
    },
    {
      model: Brands,
      as: "brand",
    },
    {
      model: Discounts,
      as: "discount",
      where: dis_where,
      required,
    },
  ];
};

exports.collection_includes = (where, dep_type, required) => {
  return [
    {
      model: Categories,
      as: "categories",
      where,
      attributes: ["id", "uuid", "name_tm", "name_ru", "name_en"],
      through: { attributes: [] },
    },
    {
      model: Brands,
      as: "brand",
      attributes: ["id", "uuid", "name_tm", "name_ru", "name_en"],
    },
    {
      model: Productimages,
      as: "images",
      limit: 1,
    },
    {
      model: Discounts,
      as: "discount",
      where: { dep_type, isActive: true },
      attributes: this.discount_atts,
      required,
    },
  ];
};

exports.collection_includes_for_cart = (dep_type) => {
  return [
    {
      model: Brands,
      as: "brand",
      attributes: ["id", "uuid", "name_tm", "name_ru", "name_en"],
    },
    {
      model: Productimages,
      as: "images",
      limit: 1,
    },
    {
      model: Discounts,
      as: "discount",
      where: { dep_type, isActive: true },
      attributes: this.discount_atts,
      required: false,
    },
    {
      model: Products,
      as: "collection_products",
      attributes: this.product_atts_few,
      through: { attributes: ["quantity"] },
      include: {
        model: Productimages,
        as: "product_images",
        limit: 1,
      },
    },
  ];
};

exports.collection_includes_imd = (dep_type) => {
  return [
    {
      model: Productimages,
      as: "images",
      limit: 1,
    },
    {
      model: Discounts,
      as: "discount",
      attributes: this.discount_atts,
      where: { dep_type, isActive: true },
      required: false,
    },
  ];
};

exports.campaign_includes = (where, dep_type, stock_type) => {
  return [
    {
      model: Discounts,
      as: "discount",
      where: { dep_type, isActive: true },
      attributes: this.discount_atts,
      required: true,
    },
    {
      model: Products,
      as: "products",
      where: {
        isActive: true,
        canPublished: true,
        [stock_type]: { [Op.gt]: 0 },
        type: dep_type,
        ...where,
      },
      required: false,
      attributes: this.product_atts_few,
      through: { attributes: [] },
      include: [
        {
          model: Productimages,
          as: "product_images",
          limit: 1,
        },
        {
          model: Discounts,
          as: "discount",
          attributes: this.discount_atts,
          where: { dep_type, isActive: true },
          required: false,
        },
      ],
    },
    {
      model: Collections,
      as: "collections",
      where: {
        isActive: true,
        canPublished: true,
        [stock_type]: { [Op.gt]: 0 },
        type: dep_type,
        ...where,
      },
      required: false,
      attributes: this.collection_atts,
      through: { attributes: [] },
      include: [
        {
          model: Discounts,
          as: "discount",
          attributes: this.discount_atts,
          where: { dep_type, isActive: true },
          required: false,
        },
        {
          model: Productimages,
          as: "images",
          limit: 1,
        },
      ],
    },
  ];
};

exports.order_atts = [
  "id",
  "uuid",
  "code",
  "payment_type",
  "total_price",
  "user_name",
  "user_phone",
  "address",
  "delivery_type",
  "delivery_cost",
  "delivery_time",
  "rating",
  "comment_by_user",
  "status",
  "actionAt",
  "createdAt",
];

exports.item_atts_for_carrier = [
  "id",
  "uuid",
  "code",
  "bar_code",
  "name_tm",
  "name_ru",
  "name_en",
  "description_tm",
  "description_ru",
  "description_en",
  "price_express",
  "express_max",
  "isActive",
];
