const express = require("express");
const {
  getAllTexts,
  addText,
  editText,
  deleteText,
} = require("../../../controllers/admin/textControllers");
const router = express.Router();

router.get("/", getAllTexts);
router.post("/add", addText);
router.patch("/edit/:uuid", editText);
router.delete("/delete/:uuid", deleteText);

module.exports = router;
