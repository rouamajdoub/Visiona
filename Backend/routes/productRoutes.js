const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  deleteProductImage,
  getProductStats,
  getProductReviews,
  markReviewHelpful,
  toggleProductPublishStatus,
} = require("../controllers/productController");

const {
  protect,
  restrictTo,
  requireVerified,
  requireApproved,
} = require("../middlewares/authMiddleware");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/products/");
  },
  filename: function (req, file, cb) {
    // Create unique filename with timestamp and random number
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const fileFilter = (req, file, cb) => {
  // Check file type
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Not an image! Please upload only images."), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10, // Maximum 10 files
  },
});

// Public Routes
router.get("/", getProducts); // GET /api/marketplace/products
router.get(
  "/stats",
  protect,
  restrictTo("architect", "admin"),
  getProductStats
); // GET /api/marketplace/products/stats
router.get("/:id", getProduct); // GET /api/marketplace/products/:id
router.get("/:id/reviews", getProductReviews); // GET /api/marketplace/products/:id/reviews

// Protected Routes (Require Authentication)
router.use(protect); // All routes below require authentication

// Review helpful marking
router.post("/reviews/:id/helpful", markReviewHelpful); // POST /api/marketplace/reviews/:id/helpful

// Architect Routes (Product Management)
router.post(
  "/",
  restrictTo("architect"),
  requireVerified,
  requireApproved,
  upload.fields([{ name: "productImages", maxCount: 10 }]),
  createProduct
); // POST /api/marketplace/products

router.put(
  "/:id",
  restrictTo("architect", "admin"),
  requireVerified,
  upload.fields([{ name: "productImages", maxCount: 10 }]),
  updateProduct
); // PUT /api/marketplace/products/:id

router.delete(
  "/:id",
  restrictTo("architect", "admin"),
  requireVerified,
  deleteProduct
); // DELETE /api/marketplace/products/:id

router.delete(
  "/:id/images/:imageIndex",
  restrictTo("architect", "admin"),
  requireVerified,
  deleteProductImage
); // DELETE /api/marketplace/products/:id/images/:imageIndex

router.patch(
  "/:id/toggle-publish",
  restrictTo("architect", "admin"),
  requireVerified,
  toggleProductPublishStatus
); // PATCH /api/marketplace/products/:id/toggle-publish

module.exports = router;
