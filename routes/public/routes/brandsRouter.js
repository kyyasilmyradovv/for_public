const express = require("express");
const {
  getAllBrands,
  getBrand,
} = require("../../../controllers/public/brandControllers");
const router = express.Router();

router.get("/", getAllBrands);
router.get("/:uuid", getBrand);

module.exports = router;
