const express = require("express");
const {
  getAllFaqs,
  addFaq,
  editFaq,
  deleteFaq,
} = require("../../../controllers/admin/faqControllers");
const router = express.Router();

router.get("/", getAllFaqs);
router.post("/add", addFaq);
router.patch("/edit/:uuid", editFaq);
router.delete("/delete/:uuid", deleteFaq);

module.exports = router;
