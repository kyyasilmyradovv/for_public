const express = require("express");
const {
  getAllOrders,
  getOrderProducts,
  editOrder,
  removeItem,
  addItem,
} = require("../../../controllers/admin/orderControllers");
const router = express.Router();

router.get("/", getAllOrders);
router.get("/items/:uuid", getOrderProducts);
router.patch("/edit/:uuid", editOrder);
router.patch("/remove-item", removeItem);
router.post("/add-item", addItem);

module.exports = router;
