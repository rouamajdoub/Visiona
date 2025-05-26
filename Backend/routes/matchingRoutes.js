// routes/matchingRoutes.js
const express = require("express");
const router = express.Router();
const {
  protect,
  requireVerified,
  restrictTo,
} = require("../middlewares/authMiddleware");
const matchingController = require("../controllers/matchingController");

// Protect all matching routes
router.use(protect);
router.use(requireVerified);

// Route to trigger matching process (Client only)
router.post("/", restrictTo("client"), matchingController.matchNeedSheet);

// Get matches for a needsheet (Client & matched architects)
router.get("/:needsheetId", matchingController.getMatches);

// Client routes - update match status from client side
router.put(
  "/:needsheetId/client-status",
  restrictTo("client"),
  matchingController.updateClientMatchStatus
);

// Architect routes - update match status from architect side
router.put(
  "/:needsheetId/architect-status",
  restrictTo("architect"),
  matchingController.updateArchitectMatchStatus
);

// Refresh matches (Client only)
router.post(
  "/:needsheetId/refresh",
  restrictTo("client"),
  matchingController.refreshMatches
);

module.exports = router;
