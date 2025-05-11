// routes/serviceSubcategoryRoutes.js
const express = require("express");
const router = express.Router();
const serviceSubcategoryController = require("../controllers/serviceSubcategoryController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");
// Apply middleware to all admin routes
router.use(protect);
router.use(restrictTo("admin"));

// Create a new subcategory - Admin only
router.post("/", serviceSubcategoryController.createSubcategory);

// Get all subcategories - Public access
// Can filter by parent category using query param: ?categoryId=xyz
router.get("/", serviceSubcategoryController.getAllSubcategories);

// Get subcategory by ID - Public access
router.get("/:id", serviceSubcategoryController.getSubcategoryById);

// Update subcategory - Admin only
router.put(
  "/:id",

  serviceSubcategoryController.updateSubcategory
);

// Delete subcategory - Admin only
router.delete(
  "/:id",

  serviceSubcategoryController.deleteSubcategory
);

module.exports = router;
