const express = require("express");
const {
  getSliders,
  getBannerForAdd,
} = require("../../../controllers/public/bannerControllers");
const router = express.Router();

router.get("/", getSliders);
router.get("/for-add", getBannerForAdd);

module.exports = router;
