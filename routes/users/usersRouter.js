const express = require("express");
const {
  addAddress,
  getMyAddresses,
  editMyAddress,
  deleteMyAddress,
} = require("../../controllers/users/addressControllers");
const {
  protect,
  sendMeCode,
  verifyMyCode,
  signup,
  login,
  expressProtect,
  sendMeCodeForRecovery,
} = require("../../controllers/users/authController");
const {
  addMyOrders,
  getMyOrders,
  getMyOrderProducts,
  addMyExpressOrders,
  editMyOrder,
  checkMyPromo,
} = require("../../controllers/users/ordersControllers");
const { likeItem } = require("../../controllers/public/videobannerControllers");
const {
  getMe,
  updateMyPassword,
  updateMe,
  deleteMe,
} = require("../../controllers/users/usersControllers");
const router = express.Router();

router.post("/send-me-code", sendMeCode);
router.post("/send-me-recovery-code", sendMeCodeForRecovery);
router.post("/verify-my-code", verifyMyCode);
router.post("/signup", protect, signup);
router.post("/login", login);
router.get("/my-account", protect, getMe);
router.patch("/update-me", protect, updateMe);
router.patch("/update-my-password", protect, updateMyPassword);
router.delete("/delete-me", protect, deleteMe);

router.post("/addresses/add", protect, addAddress);
router.get("/addresses", protect, getMyAddresses);
router.patch("/addresses/edit/:uuid", protect, editMyAddress);
router.delete("/addresses/delete/:uuid", protect, deleteMyAddress);

router.post("/like", protect, likeItem);
router.post("/my-orders/add", protect, addMyOrders);
router.post("/my-orders/express/add", expressProtect, addMyExpressOrders);
router.get("/my-orders", protect, getMyOrders);
router.get("/my-orders/products/:uuid", protect, getMyOrderProducts);
router.patch("/my-orders/edit/:uuid", protect, editMyOrder);
router.post("/check-my-promo", protect, checkMyPromo);

module.exports = router;
