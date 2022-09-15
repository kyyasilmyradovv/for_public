const express = require("express");
const {
  getMyCart,
  getMyFavs,
} = require("../../controllers/public/cartControllers");
const {
  getAllCategories,
} = require("../../controllers/public/categoryControllers");
const {
  getAllDeliveries,
  getAllTexts,
  getAllFaqs,
  getAllCities,
  register,
  unregister,
} = require("../../controllers/public/otherControllers");

const router = express.Router();

router.use("/baners", require("./routes/bannersRouter"));
router.use("/videobanners", require("./routes/videobannersRouter"));
router.use("/campaigns", require("./routes/campaignsRouter"));
router.use("/brands", require("./routes/brandsRouter"));
router.get("/categories", getAllCategories);
router.use("/collections", require("./routes/collectionsRouter"));
router.use("/products", require("./routes/productsRouter"));
router.get("/texts", getAllTexts);
router.get("/faqs", getAllFaqs);
router.get("/cities", getAllCities);
router.get("/deliveries", getAllDeliveries);
router.post("/my-cart", getMyCart);
router.post("/my-favs", getMyFavs);
router.post("/sms-senders/register", register);
router.delete("/sms-senders/unregister/:id", unregister);

module.exports = router;
