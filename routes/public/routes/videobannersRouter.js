const express = require("express");
const {
  getAllVideobanners,
  getVideobanner,
  getSavedVideobanners,
} = require("../../../controllers/public/videobannerControllers");
const router = express.Router();

router.get("/", getAllVideobanners);
router.post("/saved", getSavedVideobanners);
router.get("/:uuid", getVideobanner);

module.exports = router;
