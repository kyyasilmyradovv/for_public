const express = require("express");
const {
  getAllCampaigns,
  getCampaign,
  getCampaignsForHome,
} = require("../../../controllers/public/campaignControllers");
const router = express.Router();

router.get("/", getAllCampaigns);
router.get("/for-home", getCampaignsForHome);
router.get("/:uuid", getCampaign);

module.exports = router;
