const express = require("express");
const {
  addProduct,
  editProduct,
  uploadPhoto,
  uploadProductImage,
  deleteProduct,
  getAllProducts,
  deleteProductImage,
  addDiscount,
  deleteDiscount,
  getProduct,
  getStockProducts,
} = require("../../../controllers/admin/productControllers");
const router = express.Router();

router.get("/", getAllProducts);
router.get("/stock", getStockProducts);
router.get("/:uuid", getProduct);
router.post("/add", addProduct);
router.post("/discount/add", addDiscount);
router.patch("/edit/:uuid", editProduct);
router.delete("/delete/:uuid", deleteProduct);
router.delete("/discount/delete/:uuid", deleteDiscount);
router.delete("/delete-image/:uuid", deleteProductImage);
router.post("/upload-image/:uuid", uploadPhoto, uploadProductImage);

module.exports = router;
