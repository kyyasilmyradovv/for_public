const express = require("express");
const {
  getAllAdmins,
  getAdmin,
  addAdmin,
  editAdmin,
  deleteAdmin,
} = require("../../../controllers/admin/adminControllers");
const router = express.Router();

router.get("/", getAllAdmins);
router.post("/", addAdmin);
router.patch("/edit/:uuid", editAdmin);
router.delete("/delete/:uuid", deleteAdmin);
router.get("/:uuid", getAdmin);

module.exports = router;
