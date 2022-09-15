const express = require("express");
const {
  addWholesaler,
  editWholesaler,
  getAllWholesalers,
  getWholesalerOrders,
  editOrder,
  deleteWholesaler,
  deleteOrderProduct,
  getWholesaler,
} = require("../../../controllers/admin/wholesalerControllers");
const router = express.Router();

router.get("/", getAllWholesalers);
router.get("/orders", getWholesalerOrders);
router.post("/add", addWholesaler);
router.patch("/edit/:uuid", editWholesaler);
router.patch("/orders/edit/:uuid", editOrder);
router.delete("/delete/:uuid", deleteWholesaler);
router.delete("/orders/delete-product/:uuid", deleteOrderProduct);
router.get("/:uuid", getWholesaler);

module.exports = router;
