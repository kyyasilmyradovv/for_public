const express = require("express");
const {
  addCategory,
  editCategory,
  deleteCategory,
  getAllCategories,
  getCategory,
  uploadPhoto,
  reorder,
} = require("../../../controllers/admin/categoryControllers");
const router = express.Router();

router.get("/", getAllCategories);
router.get("/:uuid", getCategory);
router.post("/add", uploadPhoto, addCategory);
router.patch("/edit/:uuid", uploadPhoto, editCategory);
router.patch("/reorder", reorder);
router.delete("/delete/:uuid", deleteCategory);

module.exports = router;
