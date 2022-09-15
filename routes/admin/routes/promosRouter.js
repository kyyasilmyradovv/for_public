const express = require("express");
const {
  getAllPromos,
  addPromo,
  editPromo,
  deletePromo,
} = require("../../../controllers/admin/promoControllers");
const router = express.Router();

router.get("/", getAllPromos);
router.post("/add", addPromo);
router.patch("/edit/:uuid", editPromo);
router.delete("/delete/:uuid", deletePromo);

module.exports = router;
