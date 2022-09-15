const express = require("express");
const {
  getAllVideobanners,
  getVideobanner,
  uploadVideo,
  addVideobanner,
  editVideobanner,
  deleteVideobanner,
  uploadPhoto,
  deleteFile,
  saveVideo,
  savePhoto,
} = require("../../../controllers/admin/videobannerControllers");
const router = express.Router();

router.get("/", getAllVideobanners);
router.get("/:uuid", getVideobanner);
router.post("/add", uploadPhoto, addVideobanner);
router.post("/upload-video/:uuid", uploadVideo, saveVideo);
router.post("/upload-photo/:uuid", uploadPhoto, savePhoto);
router.patch("/edit/:uuid", editVideobanner);
router.delete("/delete/:uuid", deleteVideobanner);
router.delete("/delete-file/:uuid", deleteFile);

module.exports = router;
