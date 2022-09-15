const express = require("express");
const {
  getAllCollections,
  getCollection,
} = require("../../../controllers/public/collectionControllers");
const router = express.Router();

router.get("/", getAllCollections);
router.get("/:uuid", getCollection);

module.exports = router;
