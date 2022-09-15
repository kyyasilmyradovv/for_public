const express = require("express");
const {
  getAllDeliveries,
  addDelivery,
  editDelivery,
  deleteDelivery,
} = require("../../../controllers/admin/deliveryControllers");
const router = express.Router();

router.get("/", getAllDeliveries);
router.post("/add", addDelivery);
router.patch("/edit/:uuid", editDelivery);
router.delete("/delete/:uuid", deleteDelivery);

module.exports = router;
