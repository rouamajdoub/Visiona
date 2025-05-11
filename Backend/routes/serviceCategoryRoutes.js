const express = require("express");
const router = express.Router();
const serviceCategoryController = require("../controllers/serviceCategoryController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

// Apply middleware to all admin routes
router.use(protect);
router.use(restrictTo("admin"));

// Create a new category - Admin only (now middleware is applied at router level)
router.post("/", serviceCategoryController.createCategory);

// Update category - Admin only
router.put("/:id", serviceCategoryController.updateCategory);

// Delete category - Admin only
router.delete("/:id", serviceCategoryController.deleteCategory);

// Optionally, define public routes separately (without middleware)
// These routes must be defined BEFORE applying the middleware
router.get("/", serviceCategoryController.getAllCategories);
router.get("/:id", serviceCategoryController.getCategoryById);

module.exports = router;
