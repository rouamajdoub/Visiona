const express = require("express");
const router = express.Router();
const { protect, requireVerified } = require("../middlewares/authMiddleware");
const matchingController = require("../controllers/matchingController");

// Protect all matching routes
router.use(protect);
router.use(requireVerified);

// Route to trigger matching process
router.post("/", matchingController.matchNeedSheet);

module.exports = router;
