const express = require("express");
const {
  login,
  protect,
} = require("../../controllers/wholesalers/authController");

const router = express.Router();

router.post("/login", login);
// router.get("/orders", protect, getOrders);
// router.get("/worders", protect, getWorders);
// router.patch("/orders/edit/:uuid", protect, editOrder);
// router.patch("/worders/edit/:uuid", protect, editWorder);
// router.get("/orders/products/:uuid", protect, getOrderProducts);
// router.get("/worders/products/:uuid", protect, getWorderProducts);

module.exports = router;
