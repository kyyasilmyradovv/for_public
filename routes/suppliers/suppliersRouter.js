const express = require("express");
const {
  getMyOrders,
  getOrderProducts,
  editOrder,
} = require("../../controllers/suppliers/supplierControllers");
const { protect } = require("../../controllers/users/authController");
const router = express.Router();

router.get("/orders", protect, getMyOrders);
router.get("/orders/products/:uuid", protect, getOrderProducts);
router.patch("/my-orders/edit/:uuid", protect, editOrder);

module.exports = router;
