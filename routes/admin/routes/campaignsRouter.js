const express = require("express");
const {
  getAllCampaigns,
  getCampaign,
  addCampaign,
  editCampaign,
  uploadPhoto,
  deleteCampaign,
  addDiscount,
  deleteDiscount,
  applyDiscount,
} = require("../../../controllers/admin/campaignControllers");
const router = express.Router();

router.get("/", getAllCampaigns);
router.get("/:uuid", getCampaign);
router.post("/add", uploadPhoto, addCampaign);
router.patch("/edit/:uuid", uploadPhoto, editCampaign);
router.post("/discount/add", addDiscount);
router.delete("/discount/delete/:uuid", deleteDiscount);
router.post("/discount/apply/:uuid", applyDiscount);
router.delete("/delete/:uuid", deleteCampaign);

module.exports = router;
