const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const auth = require("../middlewares/authMiddleware");

// Routes that don't require authentication
router.get("/projects/:id/reviews", reviewController.getProjectReviews);
router.get("/products/:id/reviews", reviewController.getProductReviews);
router.get("/app/reviews", reviewController.getAppReviews);

// Routes that require authentication
router.use(auth.protect);
router.use(auth.requireVerified);
router.use(auth.requireApproved);

// Only clients and architects can create reviews
const allowedRoles = ["client", "architect"];
const restrictToAllowedRoles = auth.restrictTo(...allowedRoles);

// Create reviews
router.post(
  "/projects/:id/reviews",
  restrictToAllowedRoles,
  reviewController.createProjectReview
);
router.post(
  "/products/:id/reviews",
  restrictToAllowedRoles,
  reviewController.createProductReview
);
router.post(
  "/app/reviews",
  restrictToAllowedRoles,
  reviewController.createAppReview
);

// Get current user's reviews
router.get("/my-reviews", reviewController.getMyReviews);

// Admin-only routes
router.use(auth.restrictTo("admin"));

// Get suspicious reviews flagged by AI
router.get("/reviews/suspicious", reviewController.getSuspiciousReviews);

// Update review status (publish/reject)
router.patch("/reviews/:id/status", reviewController.updateReviewStatus);

// Delete a review
router.delete("/reviews/:id", reviewController.deleteReview);

// Get specific review by ID (placed after /reviews/suspicious to prevent route conflict)
router.get("/reviews/:id", reviewController.getReview);

module.exports = router;
