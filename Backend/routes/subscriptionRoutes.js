// routes/subscriptionRoutes.js - Enhanced version with Stripe integration
const express = require("express");
const router = express.Router();
const subscriptionController = require("../controllers/subscriptionController");

// IMPORTANT: Webhook route must be BEFORE express.json() middleware
// This should be added to your main app.js file with raw body parsing
// router.post("/webhook", express.raw({type: 'application/json'}), subscriptionController.handleStripeWebhook);

// Stripe Checkout Routes
router.post(
  "/create-checkout-session",
  subscriptionController.createCheckoutSession
);
router.get(
  "/verify-session/:sessionId",
  subscriptionController.verifyCheckoutSession
);

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

// Subscription management routes
router.put("/:id/cancel", subscriptionController.cancelSubscription);

// Utility routes
router.post("/check-expired", subscriptionController.checkExpiredSubscriptions);
router.get("/stats/overview", subscriptionController.getSubscriptionStats);

// Feature access check
router.get(
  "/access/:architectId/:feature",
  subscriptionController.checkFeatureAccess
);

module.exports = router;
