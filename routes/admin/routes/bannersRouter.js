const express = require("express");
const {
  getAllBanners,
  getBanner,
  uploadPhoto,
  uploadBannerImage,
  addBanner,
  editBanner,
  deleteBanner,
  deleteBannerImage,
} = require("../../../controllers/admin/bannerControllers");
const router = express.Router();

router.get("/", getAllBanners);
router.get("/:uuid", getBanner);
router.post("/add", addBanner);
router.patch("/edit/:uuid", editBanner);
router.delete("/delete/:uuid", deleteBanner);
router.post("/upload-image/:uuid", uploadPhoto, uploadBannerImage);
router.delete("/delete-image/:uuid", deleteBannerImage);

module.exports = router;
