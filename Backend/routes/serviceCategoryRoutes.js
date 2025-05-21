const express = require("express");
const router = express.Router();
const serviceCategoryController = require("../controllers/serviceCategoryController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

// ✅ PUBLIC ROUTES (accessible to everyone)
router.get("/", serviceCategoryController.getAllCategories);
router.get("/:id", serviceCategoryController.getCategoryById);

// 🔒 PROTECTED ROUTES (admin only)
router.use(protect);
router.use(restrictTo("admin"));

router.post("/", serviceCategoryController.createCategory);
router.put("/:id", serviceCategoryController.updateCategory);
router.delete("/:id", serviceCategoryController.deleteCategory);

module.exports = router;
