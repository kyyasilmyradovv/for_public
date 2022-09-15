const catchAsync = require("../../utils/catchAsync");
const { Categories } = require("../../models");
const { category_atts } = require("./../../utils/attributes");

exports.getAllCategories = catchAsync(async (req, res) => {
  let { limit, offset } = req.query,
    attributes = category_atts,
    where = {
      isActive: true,
      type: ["both", req.query.type || "market"],
    },
    include = {
      model: Categories,
      as: "category_childs",
      where,
      attributes,
      required: false,
    };
  const categories = await Categories.findAll({
    order: [
      ["priority", "ASC"],
      [{ model: Categories, as: "category_childs" }, "priority", "asc"],
      [
        { model: Categories, as: "category_childs" },
        { model: Categories, as: "category_childs" },
        "priority",
        "asc",
      ],
    ],
    where: {
      parentId: null,
      ...where,
    },
    attributes,
    include: { ...include, include },
    limit,
    offset,
  });

  return res.status(200).send(categories);
});
