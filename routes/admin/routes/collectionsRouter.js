const express = require("express");
const {
  getAllCollections,
  getCollection,
  addCollection,
  editCollection,
  uploadPhoto,
  uploadCollectionImage,
  deleteCollection,
  addDiscount,
  deleteDiscount,
  deleteCollectionImage,
} = require("../../../controllers/admin/collectionControllers");
const router = express.Router();

router.get("/", getAllCollections);
router.get("/:uuid", getCollection);
router.post("/add", addCollection);
router.post("/discount/add", addDiscount);
router.patch("/edit/:uuid", editCollection);
router.delete("/delete/:uuid", deleteCollection);
router.delete("/discount/delete/:uuid", deleteDiscount);
router.post("/upload-image/:uuid", uploadPhoto, uploadCollectionImage);
router.delete("/delete-image/:uuid", deleteCollectionImage);

module.exports = router;
