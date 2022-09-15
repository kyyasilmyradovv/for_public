const express = require("express");
const {
  login,
  protect,
  getMe,
  updateMyDeviceToken,
} = require("../../controllers/carriers/authController");
const {
  getMyOrders,
  getMyWorders,
  editOrder,
  editWorder,
  getOrderItems,
  getWorderItems,
  getMyItems,
  getNewExpressOrders,
} = require("../../controllers/carriers/carrierControllers");
const router = express.Router();

router.post("/login", login);
router.get("/get-me", protect, getMe);
router.get("/get-my-items", protect, getMyItems);
router.post("/update-my-device-token", protect, updateMyDeviceToken);
router.get("/new-express-orders", protect, getNewExpressOrders);
router.get("/my-orders", protect, getMyOrders);
router.get("/my-worders", protect, getMyWorders);
router.patch("/orders/edit/:uuid", protect, editOrder);
router.patch("/worders/edit/:uuid", protect, editWorder);
router.get("/orders/items/:uuid", protect, getOrderItems);
router.get("/worders/items/:uuid", protect, getWorderItems);

module.exports = router;
