const express = require("express");
const router = express.Router();
const {
  createGlobalOption,
  getGlobalOptions,
  getGlobalOptionById,
  updateGlobalOption,
  deleteGlobalOption,
} = require("../controllers/GlobalOptionController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

// Public route for architects to access the global options (GET only)
router.get("/", getGlobalOptions);

// Admin-only routes
router.post("/", protect, restrictTo("admin"), createGlobalOption);
router.get("/:id", protect, restrictTo("admin"), getGlobalOptionById);
router.put("/:id", protect, restrictTo("admin"), updateGlobalOption);
router.delete("/:id", protect, restrictTo("admin"), deleteGlobalOption);

module.exports = router;
