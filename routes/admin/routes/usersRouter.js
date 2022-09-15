const express = require("express");
const {
  getAllUsers,
  editUser,
  getUserOrders,
  getOrderProducts,
  getUser,
} = require("../../../controllers/admin/userControllers");
const router = express.Router();

router.get("/", getAllUsers);
router.patch("/edit/:uuid", editUser);
router.get("/orders", getUserOrders);
router.get("/order-products", getOrderProducts);
router.get("/:uuid", getUser);

module.exports = router;
