const express = require("express");
const router = express.Router();
const architectController = require("../controllers/profileController");
const {
  protect,
  restrictTo,
  requireApproved,
} = require("../middlewares/authMiddleware");
const upload = require("../middlewares/fileUpload");

// Public routes (accessible to clients)
// Get all architects with filtering
router.get("/", architectController.getAllArchitects);

// Get public architect profile by ID
router.get("/:id", architectController.getArchitectProfile);

// Get service categories and subcategories
router.get("/options/services", architectController.getServiceOptions);

// Get global options (certifications and software)
router.get("/options/global", architectController.getGlobalOptions);

// Protected routes for architects
router.use(protect);
router.use(restrictTo("architect"));
router.use(requireApproved);

// Get own profile
router.get("/profile/me", architectController.getMyProfile);

// Update profile with file uploads
router.put("/profile/update", upload, architectController.updateProfile);

// Remove portfolio image
router.delete(
  "/profile/portfolio/:imageIndex",
  architectController.removePortfolioImage
);

// Remove certification file
router.delete(
  "/profile/certification/:certIndex",
  architectController.removeCertification
);

module.exports = router;
