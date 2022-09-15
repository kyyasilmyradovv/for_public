const express = require("express");
const {
  getItemCounts,
  getCurrentStats,
  getIncome,
  getStats,
  getLastSeven,
  getTodayExpress,
} = require("../../../controllers/admin/statisticsControllers");
const router = express.Router();

router.get("/item-counts", getItemCounts);
router.get("/current", getCurrentStats);
router.get("/income", getIncome);
router.get("/last-seven", getLastSeven);
router.get("/today-express", getTodayExpress);
router.get("/", getStats);

module.exports = router;
