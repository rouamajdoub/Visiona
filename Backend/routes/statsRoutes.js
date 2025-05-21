const express = require("express");
const router = express.Router();
const { getArchitectStats } = require("../controllers/statArchController");
const {
  protect,
  restrictTo,
  requireApproved,
} = require("../middlewares/authMiddleware");

/**
 * @route   GET /api/architects/:id/stats
 * @desc    Get comprehensive statistics for an architect dashboard
 * @access  Private (architect only)
 */
router.get(
  "/:id/stats",
  protect,
  restrictTo("architect"),
  requireApproved,
  getArchitectStats
);

module.exports = router;
