const Product = require("../models/Product");
const Category = require("../models/Category");
const ProductReview = require("../models/Review");
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
    query.isPublished =
      req.query.includeUnpublished === "true" ? { $in: [true, false] } : true;

    // Search query (title, description)
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, "i");
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { "specifications.value": searchRegex },
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
      else if (req.query.sort === "rating") sortBy = { averageRating: -1 };
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

    const product = await Product.findOne(query)
      .populate("category", "name slug")
      .populate("seller", "pseudo profilePicture")
      .populate({
        path: "reviews",
        options: { sort: { createdAt: -1 }, limit: 5 },
        populate: {
          path: "user",
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
      const imageFiles = req.files.productImages;
      const imageUrls = imageFiles.map(
        (file) => `/uploads/products/${file.filename}`
      );

      // Add image URLs to the product data
      req.body.images = imageUrls;
    }

    // Create product
    const product = await Product.create(req.body);

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
 * @access  Private (Product Owner Only)
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
      const imageFiles = req.files.productImages;
      const newImageUrls = imageFiles.map(
        (file) => `/uploads/products/${file.filename}`
      );

      // Decide how to handle the images:
      if (req.body.replaceExistingImages === "true") {
        // Replace all existing images
        req.body.images = newImageUrls;

        // Optionally delete the old image files (requires additional handling)
        // This is left as a future enhancement
      } else {
        // Append new images to existing ones
        const existingImages = product.images || [];
        req.body.images = [...existingImages, ...newImageUrls];
      }
    }

    // Update product
    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

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

    await product.deleteOne();

    res.status(200).json({
      success: true,
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
 * @access  Private (Product Owner Only)
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

    // Get the image path
    const imagePath = product.images[imageIndex];

    // Remove the image from the array
    product.images.splice(imageIndex, 1);
    await product.save();

    // Optionally: Delete the actual file from the server
    // This is a more complex operation that requires proper error handling
    // const fullPath = path.join(__dirname, '..', '..', imagePath);
    // fs.unlink(fullPath, (err) => {
    //   if (err) console.error("Error deleting image file:", err);
    // });

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

    // Filter options - now using ProductReview discriminator
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

    // Import ProductReview discriminator
    const { ProductReview } = require("../models/Review");

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
    const { Review } = require("../models/Review"); // Import the base Review model

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
    if (review.usersWhoFoundHelpful.includes(req.user.id)) {
      // Remove the user's vote
      review.usersWhoFoundHelpful = review.usersWhoFoundHelpful.filter(
        (userId) => userId.toString() !== req.user.id
      );
      review.helpfulVotes = review.usersWhoFoundHelpful.length;

      await review.save();

      return res.status(200).json({
        success: true,
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
