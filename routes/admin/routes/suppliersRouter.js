const express = require("express");
const {
  getAllSuppliers,
  addOrder,
  editOrder,
  deleteOrderProduct,
  getSupplierOrders,
  getOrderProducts,
  getSupplier,
} = require("../../../controllers/admin/supplierControllers");
const router = express.Router();

router.get("/", getAllSuppliers);
router.get("/orders", getSupplierOrders);
router.get("/order-products", getOrderProducts);
router.get("/:uuid", getSupplier);
router.post("/orders/add", addOrder);
router.patch("/orders/edit/:uuid", editOrder);
router.delete("/orders/delete-product/:uuid", deleteOrderProduct);

module.exports = router;
