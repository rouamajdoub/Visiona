const express = require("express");
const router = express.Router();
const architectController = require("../controllers/profileController");
const authMiddleware = require("../middlewares/authMiddleware");

router.use(authMiddleware.protect);
router.use(authMiddleware.restrictTo("architect"));

router.get("/me", architectController.getMyProfile);
router.put(
  "/me",
  architectController.uploadFiles,
  architectController.updateMyProfile
);
router.delete("/me", architectController.deleteMyProfile);

router.delete(
  "/me/portfolio/:itemIndex",
  architectController.deletePortfolioItem
);

router.get("/me/stats", architectController.getMyStats);
router.put("/me/payment", architectController.updatePaymentStatus);

module.exports = router;
