const express = require("express");
const {
  getAllRegions,
  addRegion,
  editRegion,
  deleteRegion,
  getRegion,
} = require("../../../controllers/admin/regionControllers");
const router = express.Router();

router.get("/", getAllRegions);
router.get("/:uuid", getRegion);
router.post("/add", addRegion);
router.patch("/edit/:uuid", editRegion);
router.delete("/delete/:uuid", deleteRegion);

module.exports = router;
