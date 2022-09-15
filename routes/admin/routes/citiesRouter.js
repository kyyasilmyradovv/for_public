const express = require("express");
const {
  getAllCities,
  addCity,
  editCity,
  deleteCity,
  getCity,
} = require("../../../controllers/admin/cityControllers");
const router = express.Router();

router.get("/", getAllCities);
router.get("/:uuid", getCity);
router.post("/add", addCity);
router.patch("/edit/:uuid", editCity);
router.delete("/delete/:uuid", deleteCity);

module.exports = router;
