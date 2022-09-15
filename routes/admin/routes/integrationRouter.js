const express = require("express");
const router = express.Router();
const {
  syncCategories,
  getSyncOrders,
  syncOrder,
  syncItems,
  syncClients,
  protectIntegration,
} = require("../../../controllers/admin/integrationControllers");

router.post("/sync-categories", protectIntegration, syncCategories);
router.get("/sync-orders", getSyncOrders);
router.post("/sync-orders", protectIntegration, syncOrder);
router.post("/sync-clients", protectIntegration, syncClients);
router.post("/sync-items", protectIntegration, syncItems);

module.exports = router;
