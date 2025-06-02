// routes/serviceSubcategoryRoutes.js
const express = require("express");
const router = express.Router();
const serviceSubcategoryController = require("../controllers/serviceSubcategoryController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

// ✅ PUBLIC ROUTES (accessible to everyone)
router.get("/", serviceSubcategoryController.getAllSubcategories);

router.get("/:id", serviceSubcategoryController.getSubcategoryById);

// 🔒 PROTECTED ROUTES (admin only)
router.use(protect);
router.use(restrictTo("admin"));
router.post("/", serviceSubcategoryController.createSubcategory);
router.put("/:id", serviceSubcategoryController.updateSubcategory);
router.delete("/:id", serviceSubcategoryController.deleteSubcategory);

module.exports = router;
