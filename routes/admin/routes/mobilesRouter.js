const express = require("express");
const {
  getAllMobiles,
  deleteMobile,
} = require("../../../controllers/admin/mobilesControllers");
const router = express.Router();

router.get("/", getAllMobiles);
router.delete("/delete/:id", deleteMobile);

module.exports = router;
