// routes/subscriptionRoutes.js - Enhanced version
const express = require("express");
const router = express.Router();
const subscriptionController = require("../controllers/subscriptionController");

// Subscription CRUD routes
router.post("/", subscriptionController.createSubscription);
router.get("/", subscriptionController.getAllSubscriptions);
router.get("/:id", subscriptionController.getSubscriptionById);
router.put("/:id", subscriptionController.updateSubscription);
router.delete("/:id", subscriptionController.deleteSubscription);

// Architect-specific routes
router.get(
  "/architect/:architectId",
  subscriptionController.getSubscriptionByArchitect
);

// Payment processing routes
router.post("/process-payment", subscriptionController.processPayment);

// Utility routes
router.post("/check-expired", subscriptionController.checkExpiredSubscriptions);

// Subscription management routes
router.put("/:id/cancel", subscriptionController.cancelSubscription);
router.put("/:id/renew", subscriptionController.renewSubscription);

module.exports = router;
