// routes/needSheetRoutes.js
const express = require("express");
const router = express.Router();
const {
  createNeedSheet,
  getUserNeedSheets,
  getNeedSheet,
  updateNeedSheet,
  deleteNeedSheet,
  matchArchitectsForNeedSheet, // Add this new controller function
} = require("../controllers/needsSheetController");
const {
  protect,
  restrictTo,
  requireVerified,
} = require("../middlewares/authMiddleware");

// All routes require authentication
router.use(protect);

// All routes require the user to be verified
router.use(requireVerified);

// All routes are restricted to clients only
router.use(restrictTo("client"));

// Create need sheet and get all user's need sheets
router.route("/").post(createNeedSheet).get(getUserNeedSheets);

// Get, update and delete specific need sheet
router
  .route("/:id")
  .get(getNeedSheet)
  .put(updateNeedSheet)
  .delete(deleteNeedSheet);

// Match architects for a specific need sheet
router.route("/:id/match").get(matchArchitectsForNeedSheet);

module.exports = router;
