const express = require("express");
const router = express.Router();
const marketplaceController = require("../controllers/marketplaceController");
const {
  protect,
  restrictTo,
  requireVerified,
  requireApproved,
} = require("../middlewares/authMiddleware");
const upload = require("../middlewares/fileUpload");

// Product routes
router
  .route("/products")
  .get(marketplaceController.getProducts)
  .post(
    protect,
    requireVerified,
    restrictTo("architect", "admin"),
    requireApproved,
    upload,
    marketplaceController.createProduct
  );

// Route for deleting a single product image
router.route("/products/:id/images/:imageIndex").delete(protect);

router
  .route("/products/:id")
  .get(marketplaceController.getProduct)
  .put(protect, upload, marketplaceController.updateProduct)
  .delete(protect, marketplaceController.deleteProduct);

// Category routes
router
  .route("/categories")
  .get(marketplaceController.getCategories)
  .post(protect, restrictTo("admin"), marketplaceController.createCategory);

router
  .route("/categories/:id")
  .get(marketplaceController.getCategory)
  .put(protect, restrictTo("admin"), marketplaceController.updateCategory)
  .delete(protect, restrictTo("admin"), marketplaceController.deleteCategory);

// Product review routes - Note: Create review is now handled by a centralized review controller
router
  .route("/products/:id/reviews")
  .get(marketplaceController.getProductReviews);

// Review helpful marking
router
  .route("/reviews/:id/helpful")
  .post(protect, marketplaceController.markReviewHelpful);

// Order routes
router
  .route("/orders")
  .get(protect, marketplaceController.getUserOrders)
  .post(protect, requireVerified, marketplaceController.createOrder);

router
  .route("/orders/:id")
  .get(protect, marketplaceController.getOrder)
  .put(
    protect,
    restrictTo("architect", "admin"),
    requireApproved,
    marketplaceController.updateOrderStatus
  );

router
  .route("/orders/:id/cancel")
  .put(protect, marketplaceController.cancelOrder);

// Architect statistics route
router
  .route("/architect/stats")
  .get(
    protect,
    restrictTo("architect"),
    requireApproved,
    marketplaceController.getArchitectStats
  );

// Cart routes
router
  .route("/cart")
  .get(protect, marketplaceController.getCart)
  .post(protect, marketplaceController.addToCart)
  .delete(protect, marketplaceController.clearCart);

router
  .route("/cart/:itemId")
  .put(protect, marketplaceController.updateCartItem)
  .delete(protect, marketplaceController.removeCartItem);

// Favorites routes
router
  .route("/favorites")
  .get(protect, marketplaceController.getFavorites)
  .post(protect, marketplaceController.addToFavorites);

router
  .route("/favorites/:productId")
  .delete(protect, marketplaceController.removeFromFavorites)
  .put(protect, marketplaceController.updateFavoriteNotes);

router
  .route("/favorites/check/:productId")
  .get(protect, marketplaceController.checkFavoriteStatus);

module.exports = router;
