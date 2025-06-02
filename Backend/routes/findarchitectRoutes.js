const express = require("express");
const router = express.Router();
const {
  getArchitects,
  getArchitectProfile,
  addToFavorites,
  removeFromFavorites,
  getFavoriteArchitects,
} = require("../controllers/findArchitectController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

/**
 * Public routes - accessible to all users
 */

// GET /api/architects-List - Get all architects with filtering and pagination
router.get("/", getArchitects);

// GET /api/architects-List/:id - Get single architect profile
router.get("/:id", getArchitectProfile);

/**
 * Protected routes - require authentication
 */

// GET /api/architects-List/favorites/my - Get user's favorite architects
router.get(
  "/favorites/my",
  protect,
  restrictTo("client"),
  getFavoriteArchitects
);

// POST /api/architects-List/:architectId/favorites - Add architect to favorites
router.post(
  "/:architectId/favorites",
  protect,
  restrictTo("client"),
  addToFavorites
);

// DELETE /api/architects-List/:architectId/favorites - Remove architect from favorites
router.delete(
  "/:architectId/favorites",
  protect,
  restrictTo("client"),
  removeFromFavorites
);

module.exports = router;
