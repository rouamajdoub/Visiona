const Product = require("../models/Product");
const Category = require("../models/Category");
const { ProductReview } = require("../models/Review");
const mongoose = require("mongoose");

/**
 * @desc    Get all products with filtering, sorting and pagination
 * @route   GET /api/marketplace/products
 * @access  Public
 */
exports.getProducts = async (req, res) => {
  try {
    // Build query
    const query = {};

    // Filter by category (accepts category ID or slug)
    if (req.query.category) {
      // If category is provided as slug, find the category ID first
      if (!mongoose.Types.ObjectId.isValid(req.query.category)) {
        const category = await Category.findOne({ slug: req.query.category });
        if (category) {
          query.category = category._id;
        }
      } else {
        query.category = req.query.category;
      }
    }

    // Filter by seller
    if (req.query.seller) {
      query.seller = req.query.seller;
    }

    // Filter by price range
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
    }

    // Filter by type (physical/digital)
    if (req.query.type) {
      query.type = req.query.type;
    }

    // Filter by availability status
    if (req.query.availability) {
      query.availabilityStatus = req.query.availability;
    }

    // Filter by tags
    if (req.query.tags) {
      const tags = req.query.tags.split(",").map((tag) => tag.trim());
      query.tags = { $in: tags };
    }

    // Filter by published status (default to published only)
    // For clients, only show published products; for architects/admins, show all if requested
    if (
      req.user &&
      (req.user.role === "architect" || req.user.role === "admin")
    ) {
      query.isPublished =
        req.query.includeUnpublished === "true" ? { $in: [true, false] } : true;
    } else {
      query.isPublished = true; // Clients only see published products
    }

    // Search query (title, description, specifications)
    if (req.query.search) {
      const sanitizedSearch = req.query.search.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );
      const searchRegex = new RegExp(sanitizedSearch, "i");
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { "specifications.value": searchRegex },
        { tags: searchRegex },
      ];
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Sorting
    let sortBy = {};
    if (req.query.sort) {
      if (req.query.sort === "price-asc") sortBy = { price: 1 };
      else if (req.query.sort === "price-desc") sortBy = { price: -1 };
      else if (req.query.sort === "newest") sortBy = { createdAt: -1 };
      else if (req.query.sort === "oldest") sortBy = { createdAt: 1 };
      else if (req.query.sort === "rating") sortBy = { averageRating: -1 };
      else if (req.query.sort === "popular") sortBy = { totalReviews: -1 };
      else if (req.query.sort === "title") sortBy = { title: 1 };
      else sortBy = { createdAt: -1 }; // default sort by newest
    } else {
      sortBy = { createdAt: -1 }; // default sort by newest
    }

    // Execute query with populate
    const products = await Product.find(query)
      .populate("category", "name slug")
      .populate("seller", "pseudo profilePicture")
      .sort(sortBy)
      .skip(skip)
      .limit(limit);

    // Get total documents count for pagination
    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      count: products.length,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error: " + error.message,
    });
  }
};

/**
 * @desc    Get single product by ID or slug
 * @route   GET /api/marketplace/products/:id
 * @access  Public
 */
exports.getProduct = async (req, res) => {
  try {
    const query = {};

    // Check if the parameter is a valid ObjectId
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      query._id = req.params.id;
    } else {
      // If not, assume it's a slug
      query.slug = req.params.id;
    }

    // For clients, only show published products; for architects/admins, show all
    if (
      !req.user ||
      (req.user.role !== "architect" && req.user.role !== "admin")
    ) {
      query.isPublished = true;
    }

    const product = await Product.findOne(query)
      .populate("category", "name slug")
      .populate("seller", "pseudo profilePicture")
      .populate({
        path: "reviews",
        options: { sort: { createdAt: -1 }, limit: 5 },
        populate: {
          path: "reviewer",
          select: "pseudo profilePicture",
        },
      });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error: " + error.message,
    });
  }
};

/**
 * @desc    Create a new product (for architects only)
 * @route   POST /api/marketplace/products
 * @access  Private (Architects)
 */
exports.createProduct = async (req, res) => {
  try {
    // Check if user is an architect
    if (req.user.role !== "architect") {
      return res.status(403).json({
        success: false,
        error: "Only architects can create products",
      });
    }

    // Add the current user as the seller
    req.body.seller = req.user.id;

    // Validate category existence
    if (req.body.category) {
      const categoryExists = await Category.findById(req.body.category);
      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          error: "Category not found",
        });
      }
    }

    // Handle uploaded images if they exist
    if (req.files && req.files.productImages) {
      const imageFiles = Array.isArray(req.files.productImages)
        ? req.files.productImages
        : [req.files.productImages];

      const imageUrls = imageFiles.map((file, index) => ({
        url: `/uploads/products/${file.filename}`,
        alt: req.body.imageAlts
          ? req.body.imageAlts[index] || "Product image"
          : "Product image",
        isPrimary: index === 0, // First image is primary by default
      }));

      // Add image URLs to the product data
      req.body.images = imageUrls;
    }

    // Handle specifications if provided
    if (
      req.body.specifications &&
      typeof req.body.specifications === "string"
    ) {
      try {
        req.body.specifications = JSON.parse(req.body.specifications);
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: "Invalid specifications format",
        });
      }
    }

    // Handle tags if provided as string
    if (req.body.tags && typeof req.body.tags === "string") {
      req.body.tags = req.body.tags.split(",").map((tag) => tag.trim());
    }

    // Validate digital product requirements
    if (req.body.type === "digital" && !req.body.downloadLink) {
      return res.status(400).json({
        success: false,
        error: "Download link is required for digital products",
      });
    }

    // Create product
    const product = await Product.create(req.body);

    // Populate the created product before sending response
    await product.populate("category", "name slug");
    await product.populate("seller", "pseudo profilePicture");

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);

      return res.status(400).json({
        success: false,
        error: messages.join(", "),
      });
    }

    res.status(500).json({
      success: false,
      error: "Server Error: " + error.message,
    });
  }
};

/**
 * @desc    Update product
 * @route   PUT /api/marketplace/products/:id
 * @access  Private (Product Owner or Admin)
 */
exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    // Check if user is the product owner or admin
    if (
      product.seller.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        error: "You are not authorized to update this product",
      });
    }

    // Handle uploaded images if they exist
    if (req.files && req.files.productImages) {
      const imageFiles = Array.isArray(req.files.productImages)
        ? req.files.productImages
        : [req.files.productImages];

      const newImageUrls = imageFiles.map((file, index) => ({
        url: `/uploads/products/${file.filename}`,
        alt: req.body.imageAlts
          ? req.body.imageAlts[index] || "Product image"
          : "Product image",
        isPrimary: false, // New images are not primary by default
      }));

      // Decide how to handle the images:
      if (req.body.replaceExistingImages === "true") {
        // Replace all existing images
        req.body.images = newImageUrls;
        // Set first new image as primary
        if (newImageUrls.length > 0) {
          req.body.images[0].isPrimary = true;
        }
      } else {
        // Append new images to existing ones
        const existingImages = product.images || [];
        req.body.images = [...existingImages, ...newImageUrls];
      }
    }

    // Handle specifications if provided
    if (
      req.body.specifications &&
      typeof req.body.specifications === "string"
    ) {
      try {
        req.body.specifications = JSON.parse(req.body.specifications);
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: "Invalid specifications format",
        });
      }
    }

    // Handle tags if provided as string
    if (req.body.tags && typeof req.body.tags === "string") {
      req.body.tags = req.body.tags.split(",").map((tag) => tag.trim());
    }

    // Validate digital product requirements
    if (
      req.body.type === "digital" &&
      !req.body.downloadLink &&
      !product.downloadLink
    ) {
      return res.status(400).json({
        success: false,
        error: "Download link is required for digital products",
      });
    }

    // Update product
    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("category", "name slug")
      .populate("seller", "pseudo profilePicture");

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);

      return res.status(400).json({
        success: false,
        error: messages.join(", "),
      });
    }

    res.status(500).json({
      success: false,
      error: "Server Error: " + error.message,
    });
  }
};

/**
 * @desc    Delete product
 * @route   DELETE /api/marketplace/products/:id
 * @access  Private (Product Owner or Admin)
 */
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    // Check if user is the product owner or admin
    if (
      product.seller.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        error: "You are not authorized to delete this product",
      });
    }

    // Delete associated reviews first
    await ProductReview.deleteMany({ product: req.params.id });

    // Delete the product
    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error: " + error.message,
    });
  }
};

/**
 * @desc    Delete product image
 * @route   DELETE /api/marketplace/products/:id/images/:imageIndex
 * @access  Private (Product Owner or Admin)
 */
exports.deleteProductImage = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    // Check if user is the product owner or admin
    if (
      product.seller.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        error: "You are not authorized to update this product",
      });
    }

    const imageIndex = parseInt(req.params.imageIndex);

    // Check if the image index is valid
    if (
      isNaN(imageIndex) ||
      imageIndex < 0 ||
      imageIndex >= product.images.length
    ) {
      return res.status(400).json({
        success: false,
        error: "Invalid image index",
      });
    }

    // Don't allow deletion if it's the only image
    if (product.images.length === 1) {
      return res.status(400).json({
        success: false,
        error: "Cannot delete the only image. Please add another image first.",
      });
    }

    // Check if the image to be deleted is primary
    const wasImagePrimary = product.images[imageIndex].isPrimary;

    // Remove the image from the array
    product.images.splice(imageIndex, 1);

    // If the deleted image was primary, make the first remaining image primary
    if (wasImagePrimary && product.images.length > 0) {
      product.images[0].isPrimary = true;
    }

    await product.save();

    res.status(200).json({
      success: true,
      message: "Image deleted successfully",
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error: " + error.message,
    });
  }
};

/**
 * @desc    Get product statistics (for architects and admins)
 * @route   GET /api/marketplace/products/stats
 * @access  Private (Architects and Admins)
 */
exports.getProductStats = async (req, res) => {
  try {
    // Check if user is architect or admin
    if (req.user.role !== "architect" && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Access denied",
      });
    }

    const query = {};

    // If user is architect (not admin), only show their products
    if (req.user.role === "architect") {
      query.seller = req.user.id;
    }

    // Get basic counts
    const totalProducts = await Product.countDocuments(query);
    const publishedProducts = await Product.countDocuments({
      ...query,
      isPublished: true,
    });
    const unpublishedProducts = await Product.countDocuments({
      ...query,
      isPublished: false,
    });

    // Get products by category
    const productsByCategory = await Product.aggregate([
      { $match: query },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categoryInfo",
        },
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          categoryName: { $first: "$categoryInfo.name" },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Get products by type
    const productsByType = await Product.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get products by availability status
    const productsByAvailability = await Product.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$availabilityStatus",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get top rated products
    const topRatedProducts = await Product.find(query)
      .sort({ averageRating: -1, totalReviews: -1 })
      .limit(5)
      .populate("category", "name")
      .select("title averageRating totalReviews price");

    // Get recent products
    const recentProducts = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("category", "name")
      .select("title createdAt price isPublished");

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalProducts,
          publishedProducts,
          unpublishedProducts,
        },
        productsByCategory,
        productsByType,
        productsByAvailability,
        topRatedProducts,
        recentProducts,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error: " + error.message,
    });
  }
};

/**
 * @desc    Get product reviews
 * @route   GET /api/marketplace/products/:id/reviews
 * @access  Public
 */
exports.getProductReviews = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Filter options
    const filterOptions = {
      product: req.params.id,
      status: "published",
    };
    let sortOptions = {};

    // Filter by rating if requested
    if (req.query.rating) {
      filterOptions.rating = parseInt(req.query.rating, 10);
    }

    // Sort options
    if (req.query.sort === "recent") {
      sortOptions = { createdAt: -1 };
    } else if (req.query.sort === "helpful") {
      sortOptions = { helpfulVotes: -1 };
    } else if (req.query.sort === "rating-high") {
      sortOptions = { rating: -1 };
    } else if (req.query.sort === "rating-low") {
      sortOptions = { rating: 1 };
    } else {
      sortOptions = { createdAt: -1 }; // Default sort
    }

    const reviews = await ProductReview.find(filterOptions)
      .populate("reviewer", "pseudo profilePicture")
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await ProductReview.countDocuments(filterOptions);

    res.status(200).json({
      success: true,
      count: reviews.length,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error: " + error.message,
    });
  }
};

/**
 * @desc    Mark review as helpful
 * @route   POST /api/marketplace/reviews/:id/helpful
 * @access  Private (Authenticated Users)
 */
exports.markReviewHelpful = async (req, res) => {
  try {
    const { Review } = require("../models/Review");

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: "Review not found",
      });
    }

    // Check if usersWhoFoundHelpful exists, if not create it
    if (!review.usersWhoFoundHelpful) {
      review.usersWhoFoundHelpful = [];
    }

    // Check if helpfulVotes exists, if not initialize it
    if (review.helpfulVotes === undefined) {
      review.helpfulVotes = 0;
    }

    // Check if user has already marked this review as helpful
    const userIndex = review.usersWhoFoundHelpful.findIndex(
      (userId) => userId.toString() === req.user.id
    );

    if (userIndex !== -1) {
      // Remove the user's vote
      review.usersWhoFoundHelpful.splice(userIndex, 1);
      review.helpfulVotes = review.usersWhoFoundHelpful.length;

      await review.save();

      return res.status(200).json({
        success: true,
        message: "Review marked as not helpful",
        data: {
          helpfulVotes: review.helpfulVotes,
          marked: false,
        },
      });
    }

    // Add user to the list of users who found the review helpful
    review.usersWhoFoundHelpful.push(req.user.id);
    review.helpfulVotes = review.usersWhoFoundHelpful.length;

    await review.save();

    res.status(200).json({
      success: true,
      message: "Review marked as helpful",
      data: {
        helpfulVotes: review.helpfulVotes,
        marked: true,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error: " + error.message,
    });
  }
};

/**
 * @desc    Toggle product publish status
 * @route   PATCH /api/marketplace/products/:id/toggle-publish
 * @access  Private (Product Owner or Admin)
 */
exports.toggleProductPublishStatus = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    // Check if user is the product owner or admin
    if (
      product.seller.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        error: "You are not authorized to modify this product",
      });
    }

    // Toggle publish status
    product.isPublished = !product.isPublished;
    await product.save();

    res.status(200).json({
      success: true,
      message: `Product ${
        product.isPublished ? "published" : "unpublished"
      } successfully`,
      data: {
        id: product._id,
        isPublished: product.isPublished,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error: " + error.message,
    });
  }
};
