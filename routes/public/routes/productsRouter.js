const express = require("express");
const {
  getAllProducts,
  getProduct,
} = require("../../../controllers/public/productControllers");
const router = express.Router();

router.get("/", getAllProducts);
router.get("/:uuid", getProduct);

module.exports = router;
