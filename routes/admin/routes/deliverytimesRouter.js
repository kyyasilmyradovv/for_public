const express = require("express");
const {
  getAllDeliverytimes,
  addDeliverytime,
  editDeliverytime,
  deleteDeliverytime,
} = require("../../../controllers/admin/deliverytimeControllers");
const router = express.Router();

router.get("/", getAllDeliverytimes);
router.post("/add", addDeliverytime);
router.patch("/edit/:uuid", editDeliverytime);
router.delete("/delete/:uuid", deleteDeliverytime);

module.exports = router;
