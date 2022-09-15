const express = require("express");
const {
  getAllCarriers,
  getCarrier,
  addCarrier,
  editCarrier,
  deleteCarrier,
  getCarrierOrders,
  getCarrierWorders,
  getCarrierItems,
  editItems,
  updateCash,
  getCarriersForDelivery,
} = require("../../../controllers/admin/carrierControllers");
const router = express.Router();

router.get("/", getAllCarriers);
router.get("/for-delivery", getCarriersForDelivery);
router.get("/items/:uuid", getCarrierItems);
router.get("/orders", getCarrierOrders);
router.get("/worders", getCarrierWorders);
router.post("/add", addCarrier);
router.patch("/edit/:uuid", editCarrier);
router.patch("/update-cash/:uuid", updateCash);
router.delete("/delete/:uuid", deleteCarrier);
router.patch("/edit-items", editItems);
router.get("/:uuid", getCarrier);

module.exports = router;
