const express = require("express");
const {
  addBrand,
  editBrand,
  deleteBrand,
  uploadPhoto,
  getAllBrands,
  getBrand,
} = require("../../../controllers/admin/brandControllers");
const router = express.Router();

router.get("/", getAllBrands);
router.get("/:uuid", getBrand);
router.post("/add", uploadPhoto, addBrand);
router.patch("/edit/:uuid", uploadPhoto, editBrand);
router.delete("/delete/:uuid", deleteBrand);

module.exports = router;
