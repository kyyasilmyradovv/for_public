const cors = require("cors");
const express = require("express");
const router = express.Router();
const {
  updateMyDeviceToken,
} = require("../../controllers/admin/adminControllers");
const {
  login,
  protect,
  getMe,
} = require("../../controllers/admin/authControllers");
const {
  uploadPhoto,
  saveImage,
} = require("../../controllers/admin/otherControllers");

router.use("/integration", require("./routes/integrationRouter"));
var whitelist = ["https://admin.salam.com.tm"];
router.use(
  cors({
    origin: function (origin, callback) {
      if (whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);
router.post("/login", login);
router.get("/get-me", protect, getMe);
router.post("/upload-static-images", protect, uploadPhoto, saveImage);
router.post("/update-my-device-token", protect, updateMyDeviceToken);
router.use("/categories", protect, require("./routes/categoriesRouter"));
router.use("/brands", protect, require("./routes/brandsRouter"));
router.use("/baners", protect, require("./routes/bannersRouter"));
router.use("/campaigns", protect, require("./routes/campaignsRouter"));
router.use("/videobanners", protect, require("./routes/videobannersRouter"));
router.use("/collections", protect, require("./routes/collectionsRouter"));
router.use("/products", protect, require("./routes/productsRouter"));
router.use("/suppliers", protect, require("./routes/suppliersRouter"));
router.use("/carriers", protect, require("./routes/carriersRouter"));
router.use("/wholesalers", protect, require("./routes/wholesalersRouter"));
router.use("/users", protect, require("./routes/usersRouter"));
router.use("/orders", protect, require("./routes/ordersRouter"));
router.use("/admins", protect, require("./routes/adminsRouter"));
router.use("/cities", protect, require("./routes/citiesRouter"));
router.use("/regions", protect, require("./routes/regionsRouter"));
router.use("/deliveries", protect, require("./routes/deliveriesRouter"));
router.use("/deliverytimes", protect, require("./routes/deliverytimesRouter"));
router.use("/promos", protect, require("./routes/promosRouter"));
router.use("/texts", protect, require("./routes/textsRouter"));
router.use("/mobiles", protect, require("./routes/mobilesRouter"));
router.use("/faqs", protect, require("./routes/faqsRouter"));
router.use("/statistics", protect, require("./routes/statisticsRouter"));

module.exports = router;
