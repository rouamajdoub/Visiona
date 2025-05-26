const express = require("express");
const router = express.Router();
const { protect, restrictTo } = require("../middlewares/authMiddleware"); // Adjust path as needed
const {
  getArchitectsLocations,
  getUsersLocationStats,
  getNearbyArchitects,
} = require("../controllers/locationController");

// Public routes (for clients to see architects)
router.get("/architects", protect, getArchitectsLocations);
router.get("/architects/nearby", protect, getNearbyArchitects);

// Admin only routes
router.get("/users/stats", protect, restrictTo("admin"), getUsersLocationStats);

module.exports = router;
