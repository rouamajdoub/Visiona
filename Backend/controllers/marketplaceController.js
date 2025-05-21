const Product = require("../models/Product");
const Cart = require("../models/Cart");
const Favorite = require("../models/Favorite");
const Category = require("../models/Category");
const Order = require("../models/Order");
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

    // Check if user is the product owner
    if (product.seller.toString() !== req.user.id) {
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
 * @access  Private (Product Owner Only)
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

    // Check if user is the product owner
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
exports.deleteProductImage = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    // Check if user is the product owner
    if (product.seller.toString() !== req.user.id) {
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
 * @desc    Get categories
 * @route   GET /api/marketplace/categories
 * @access  Public
 */
exports.getCategories = async (req, res) => {
  try {
    // Build query
    const query = {};

    // Filter parent categories or sub-categories
    if (req.query.parent === "null") {
      query.parentCategory = null;
    } else if (req.query.parent) {
      query.parentCategory = req.query.parent;
    }

    const categories = await Category.find(query)
      .populate("parentCategory", "name slug")
      .populate("subcategories")
      .sort("name");

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error: " + error.message,
    });
  }
};

/**
 * @desc    Get single category by ID or slug
 * @route   GET /api/marketplace/categories/:id
 * @access  Public
 */
exports.getCategory = async (req, res) => {
  try {
    const query = {};

    // Check if the parameter is a valid ObjectId
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      query._id = req.params.id;
    } else {
      // If not, assume it's a slug
      query.slug = req.params.id;
    }

    const category = await Category.findOne(query)
      .populate("parentCategory", "name slug")
      .populate("subcategories");

    if (!category) {
      return res.status(404).json({
        success: false,
        error: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error: " + error.message,
    });
  }
};

/**
 * @desc    Create category (admin only)
 * @route   POST /api/marketplace/categories
 * @access  Private (Admin)
 */
exports.createCategory = async (req, res) => {
  try {
    // Add the current user as the creator
    req.body.createdBy = req.user.id;

    // Validate parent category if provided
    if (req.body.parentCategory) {
      const parentExists = await Category.findById(req.body.parentCategory);
      if (!parentExists) {
        return res.status(400).json({
          success: false,
          error: "Parent category not found",
        });
      }
    }

    const category = await Category.create(req.body);

    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);

      return res.status(400).json({
        success: false,
        error: messages.join(", "),
      });
    } else if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "Category with this name already exists",
      });
    }

    res.status(500).json({
      success: false,
      error: "Server Error: " + error.message,
    });
  }
};

/**
 * @desc    Update category (admin only)
 * @route   PUT /api/marketplace/categories/:id
 * @access  Private (Admin)
 */
exports.updateCategory = async (req, res) => {
  try {
    let category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        error: "Category not found",
      });
    }

    // Prevent circular references in parent category
    if (req.body.parentCategory && req.body.parentCategory === req.params.id) {
      return res.status(400).json({
        success: false,
        error: "A category cannot be its own parent",
      });
    }

    category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);

      return res.status(400).json({
        success: false,
        error: messages.join(", "),
      });
    } else if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "Category with this name already exists",
      });
    }

    res.status(500).json({
      success: false,
      error: "Server Error: " + error.message,
    });
  }
};

/**
 * @desc    Delete category (admin only)
 * @route   DELETE /api/marketplace/categories/:id
 * @access  Private (Admin)
 */
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        error: "Category not found",
      });
    }

    // Check if category has subcategories
    const hasSubcategories = await Category.countDocuments({
      parentCategory: req.params.id,
    });
    if (hasSubcategories > 0) {
      return res.status(400).json({
        success: false,
        error:
          "Cannot delete category with subcategories. Please delete or reassign subcategories first.",
      });
    }

    // Check if category has products
    const hasProducts = await Product.countDocuments({
      category: req.params.id,
    });
    if (hasProducts > 0) {
      return res.status(400).json({
        success: false,
        error:
          "Cannot delete category with associated products. Please reassign products first.",
      });
    }

    await category.deleteOne();

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

    // Filter and sort options
    const filterOptions = {
      product: req.params.id,
      reviewType: "ProductReview",
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

    const { Review } = require("../models/Review"); // Import the base Review model

    const reviews = await Review.find(filterOptions)
      .populate("reviewer", "pseudo profilePicture")
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Review.countDocuments(filterOptions);

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

/**
 * @desc    Create a new order
 * @route   POST /api/marketplace/orders
 * @access  Private (Authenticated Users)
 */
exports.createOrder = async (req, res) => {
  try {
    // Add current user to order
    req.body.user = req.user.id;

    // Validate products and calculate totals
    let totalAmount = 0;
    let items = [];

    for (const item of req.body.items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({
          success: false,
          error: `Product with ID ${item.product} not found`,
        });
      }

      // Check if product is in stock
      if (
        product.type === "physical" &&
        (product.quantity < item.quantity ||
          product.availabilityStatus !== "inStock")
      ) {
        return res.status(400).json({
          success: false,
          error: `Product ${product.title} is out of stock or insufficient quantity`,
        });
      }

      // Calculate item price (use discounted price if available)
      const price =
        product.discountedPrice > 0 ? product.discountedPrice : product.price;
      const totalPrice = price * item.quantity;

      items.push({
        product: product._id,
        quantity: item.quantity,
        price,
        totalPrice,
      });

      totalAmount += totalPrice;
    }

    // Add shipping fee and tax if applicable
    const shippingFee = req.body.shippingFee || 0;
    const tax = req.body.tax || 0;

    totalAmount += shippingFee + tax;

    // Create order with calculated values
    const orderData = {
      user: req.user.id,
      items,
      shippingAddress: req.body.shippingAddress,
      paymentMethod: req.body.paymentMethod || "cod",
      totalAmount,
      shippingFee,
      tax,
      deliveryNotes: req.body.deliveryNotes,
      estimatedDeliveryDate: req.body.estimatedDeliveryDate,
    };

    const order = await Order.create(orderData);

    // Update product quantities for physical products
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (product.type === "physical") {
        product.quantity -= item.quantity;
        if (product.quantity === 0) {
          product.availabilityStatus = "outOfStock";
        }
        await product.save();
      }
    }

    res.status(201).json({
      success: true,
      data: order,
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
 * @desc    Get user's orders
 * @route   GET /api/marketplace/orders
 * @access  Private (Authenticated Users)
 */
exports.getUserOrders = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Build query
    const query = { user: req.user.id };

    // Filter by status if provided
    if (req.query.status) {
      query.orderStatus = req.query.status;
    }

    // Filter by time period
    if (req.query.period) {
      const now = new Date();
      let startDate;

      if (req.query.period === "last30days") {
        startDate = new Date(now.setDate(now.getDate() - 30));
      } else if (req.query.period === "last6months") {
        startDate = new Date(now.setMonth(now.getMonth() - 6));
      } else if (req.query.period === "lastYear") {
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
      }

      if (startDate) {
        query.createdAt = { $gte: startDate };
      }
    }

    const orders = await Order.find(query)
      .populate({
        path: "items.product",
        select: "title slug images price type",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      count: orders.length,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error: " + error.message,
    });
  }
};

/**
 * @desc    Get single order by ID
 * @route   GET /api/marketplace/orders/:id
 * @access  Private (Order Owner or Admin)
 */
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate({
        path: "items.product",
        select: "title slug images price type dimensions weight specifications",
      })
      .populate("user", "email prenom nomDeFamille pseudo");

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    // Check authorization (only order owner or admin can view)
    if (
      order.user._id.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        error: "You are not authorized to view this order",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error: " + error.message,
    });
  }
};

/**
 * @desc    Update order status (admin or seller only)
 * @route   PUT /api/marketplace/orders/:id
 * @access  Private (Admin or Product Seller)
 */
exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate({
      path: "items.product",
      select: "seller title",
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    // Check authorization (only admin or seller of products in order can update)
    const isAdmin = req.user.role === "admin";
    const isSeller = order.items.some(
      (item) =>
        item.product.seller && item.product.seller.toString() === req.user.id
    );

    if (!isAdmin && !isSeller) {
      return res.status(403).json({
        success: false,
        error: "You are not authorized to update this order",
      });
    }

    // Update order status and tracking info if provided
    if (req.body.orderStatus) {
      order.orderStatus = req.body.orderStatus;
    }

    if (req.body.paymentStatus) {
      order.paymentStatus = req.body.paymentStatus;
    }

    // Update tracking information if provided
    if (req.body.trackingInformation) {
      order.trackingInformation = {
        ...order.trackingInformation,
        ...req.body.trackingInformation,
      };
    }

    // Update estimated delivery date if provided
    if (req.body.estimatedDeliveryDate) {
      order.estimatedDeliveryDate = req.body.estimatedDeliveryDate;
    }

    await order.save();

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error: " + error.message,
    });
  }
};

/**
 * @desc    Cancel order (user can cancel their own order)
 * @route   PUT /api/marketplace/orders/:id/cancel
 * @access  Private (Order Owner)
 */
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    // Check authorization (only order owner can cancel)
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: "You are not authorized to cancel this order",
      });
    }

    // Check if order can be cancelled
    if (order.orderStatus !== "processing") {
      return res.status(400).json({
        success: false,
        error: "Orders can only be cancelled if they are in processing state",
      });
    }

    // Update order status
    order.orderStatus = "cancelled";

    // Restore product quantities for physical products
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product && product.type === "physical") {
        product.quantity += item.quantity;
        if (product.availabilityStatus === "outOfStock") {
          product.availabilityStatus = "inStock";
        }
        await product.save();
      }
    }

    await order.save();

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error: " + error.message,
    });
  }
};

/**
 * @desc    Get seller's products statistics
 * @route   GET /api/marketplace/architect/stats
 * @access  Private (Architects)
 */
exports.getArchitectStats = async (req, res) => {
  try {
    // Total products count
    const totalProducts = await Product.countDocuments({ seller: req.user.id });

    // Products by category
    const productsByCategory = await Product.aggregate([
      { $match: { seller: new mongoose.Types.ObjectId(req.user.id) } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "categoryInfo",
        },
      },
      { $unwind: "$categoryInfo" },
      { $project: { name: "$categoryInfo.name", count: 1 } },
    ]);

    // Top rated products
    const topRatedProducts = await Product.find({ seller: req.user.id })
      .sort({ averageRating: -1, totalReviews: -1 })
      .limit(5)
      .select("title slug averageRating totalReviews");

    // Get order stats
    const orderItems = await Order.aggregate([
      { $match: { orderStatus: { $ne: "cancelled" } } },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: "$productInfo" },
      {
        $match: {
          "productInfo.seller": new mongoose.Types.ObjectId(req.user.id),
        },
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$items.totalPrice" },
          totalItems: { $sum: "$items.quantity" },
          orders: { $addToSet: "$_id" },
        },
      },
    ]);

    const salesStats = {
      totalSales: orderItems.length > 0 ? orderItems[0].totalSales : 0,
      totalItemsSold: orderItems.length > 0 ? orderItems[0].totalItems : 0,
      totalOrders: orderItems.length > 0 ? orderItems[0].orders.length : 0,
    };

    // Reviews stats
    const reviewsStats = await ProductReview.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: "$productInfo" },
      {
        $match: {
          "productInfo.seller": new mongoose.Types.ObjectId(req.user.id),
        },
      },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: "$rating" },
          ratingCounts: {
            $push: {
              rating: "$rating",
            },
          },
        },
      },
    ]);

    // Transform rating counts
    let ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    if (reviewsStats.length > 0) {
      reviewsStats[0].ratingCounts.forEach((item) => {
        ratingDistribution[item.rating] =
          (ratingDistribution[item.rating] || 0) + 1;
      });
    }

    const stats = {
      products: {
        total: totalProducts,
        byCategory: productsByCategory,
        topRated: topRatedProducts,
      },
      sales: salesStats,
      reviews: {
        total: reviewsStats.length > 0 ? reviewsStats[0].totalReviews : 0,
        averageRating:
          reviewsStats.length > 0
            ? parseFloat(reviewsStats[0].averageRating.toFixed(1))
            : 0,
        distribution: ratingDistribution,
      },
    };

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error: " + error.message,
    });
  }
};

/**
 * @desc    Get user's cart
 * @route   GET /api/cart
 * @access  Private (Authenticated Users)
 */
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate({
      path: "items.product",
      select:
        "title slug images price discountedPrice availabilityStatus quantity type",
    });

    // If no cart exists, create an empty one
    if (!cart) {
      cart = new Cart({
        user: req.user.id,
        items: [],
        totalAmount: 0,
        itemCount: 0,
      });
      await cart.save();
    }

    // Check for product availability changes
    let needsUpdate = false;

    for (const item of cart.items) {
      if (item.product) {
        // Check if physical product is out of stock
        if (
          item.product.type === "physical" &&
          (item.product.availabilityStatus !== "inStock" ||
            item.product.quantity < item.quantity)
        ) {
          // Update cart item with max available quantity or flag as unavailable
          if (item.product.quantity > 0) {
            item.quantity = Math.min(item.quantity, item.product.quantity);
          } else {
            item.quantity = 0;
          }
          needsUpdate = true;
        }

        // Check if price has changed
        const currentPrice =
          item.product.discountedPrice > 0
            ? item.product.discountedPrice
            : item.product.price;

        if (item.price !== currentPrice) {
          item.price = currentPrice;
          needsUpdate = true;
        }
      }
    }

    // If we made changes, save the cart
    if (needsUpdate) {
      // Filter out items with quantity 0
      cart.items = cart.items.filter((item) => item.quantity > 0);
      await cart.save();
    }

    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error: " + error.message,
    });
  }
};

/**
 * @desc    Add item to cart
 * @route   POST /api/cart
 * @access  Private (Authenticated Users)
 */
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Validate productId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid product ID",
      });
    }

    // Find product
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    // Check product availability for physical products
    if (product.type === "physical") {
      if (product.availabilityStatus !== "inStock") {
        return res.status(400).json({
          success: false,
          error: "Product is not available for purchase",
        });
      }

      if (product.quantity < quantity) {
        return res.status(400).json({
          success: false,
          error: `Only ${product.quantity} items available in stock`,
        });
      }
    }

    // Find user's cart or create a new one
    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = new Cart({
        user: req.user.id,
        items: [],
      });
    }

    // Get current price (discounted if available)
    const price =
      product.discountedPrice > 0 ? product.discountedPrice : product.price;

    // Create product snapshot for reference
    const productSnapshot = {
      title: product.title,
      image:
        product.images && product.images.length > 0
          ? product.images.find((img) => img.isPrimary)?.url ||
            product.images[0].url
          : null,
      type: product.type,
    };

    // Check if product is already in the cart
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      // Update existing item quantity
      cart.items[itemIndex].quantity += parseInt(quantity);
      cart.items[itemIndex].price = price; // Update price in case it changed
      cart.items[itemIndex].productSnapshot = productSnapshot; // Update snapshot
    } else {
      // Add new item to cart
      cart.items.push({
        product: productId,
        quantity: parseInt(quantity),
        price,
        productSnapshot,
      });
    }

    // Save cart (pre-save hook will calculate totals)
    await cart.save();

    // Return full cart with populated products
    const populatedCart = await Cart.findById(cart._id).populate({
      path: "items.product",
      select:
        "title slug images price discountedPrice availabilityStatus quantity type",
    });

    res.status(200).json({
      success: true,
      data: populatedCart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error: " + error.message,
    });
  }
};

/**
 * @desc    Update cart item quantity
 * @route   PUT /api/cart/:itemId
 * @access  Private (Authenticated Users)
 */
exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const itemId = req.params.itemId;

    // Validate quantity
    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        error: "Quantity must be at least 1",
      });
    }

    // Find user's cart
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        error: "Cart not found",
      });
    }

    // Find the item in the cart
    const itemIndex = cart.items.findIndex(
      (item) => item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Item not found in cart",
      });
    }

    // Check product availability for physical products
    const product = await Product.findById(cart.items[itemIndex].product);

    if (product && product.type === "physical") {
      if (product.availabilityStatus !== "inStock") {
        return res.status(400).json({
          success: false,
          error: "Product is no longer available for purchase",
        });
      }

      if (product.quantity < quantity) {
        return res.status(400).json({
          success: false,
          error: `Only ${product.quantity} items available in stock`,
        });
      }
    }

    // Update the item quantity
    cart.items[itemIndex].quantity = parseInt(quantity);

    // Update price in case it changed
    if (product) {
      const currentPrice =
        product.discountedPrice > 0 ? product.discountedPrice : product.price;
      cart.items[itemIndex].price = currentPrice;
    }

    // Save cart (pre-save hook will calculate totals)
    await cart.save();

    // Return updated cart with populated products
    const populatedCart = await Cart.findById(cart._id).populate({
      path: "items.product",
      select:
        "title slug images price discountedPrice availabilityStatus quantity type",
    });

    res.status(200).json({
      success: true,
      data: populatedCart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error: " + error.message,
    });
  }
};

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/cart/:itemId
 * @access  Private (Authenticated Users)
 */
exports.removeCartItem = async (req, res) => {
  try {
    const itemId = req.params.itemId;

    // Find user's cart
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        error: "Cart not found",
      });
    }

    // Remove the item from the cart
    cart.items = cart.items.filter((item) => item._id.toString() !== itemId);

    // Save cart (pre-save hook will calculate totals)
    await cart.save();

    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error: " + error.message,
    });
  }
};

/**
 * @desc    Clear cart (remove all items)
 * @route   DELETE /api/cart
 * @access  Private (Authenticated Users)
 */
exports.clearCart = async (req, res) => {
  try {
    // Find user's cart
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        error: "Cart not found",
      });
    }

    // Clear all items
    cart.items = [];

    // Save cart (pre-save hook will calculate totals)
    await cart.save();

    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error: " + error.message,
    });
  }
};

/**
 * @desc    Get user's favorites
 * @route   GET /api/favorites
 * @access  Private (Authenticated Users)
 */
exports.getFavorites = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Build query
    const query = { user: req.user.id };

    // Filter by category if provided
    if (req.query.category) {
      // Get products in this category first
      const products = await Product.find({
        category: req.query.category,
      }).select("_id");
      const productIds = products.map((product) => product._id);

      // Add to query
      query.product = { $in: productIds };
    }

    // Execute query with populated product details
    const favorites = await Favorite.find(query)
      .populate({
        path: "product",
        select:
          "title slug images price discountedPrice availabilityStatus category",
        populate: {
          path: "category",
          select: "name slug",
        },
      })
      .sort({ addedAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Favorite.countDocuments(query);

    res.status(200).json({
      success: true,
      count: favorites.length,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
      data: favorites,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error: " + error.message,
    });
  }
};

/**
 * @desc    Add product to favorites
 * @route   POST /api/favorites
 * @access  Private (Authenticated Users)
 */
exports.addToFavorites = async (req, res) => {
  try {
    const { productId, notes } = req.body;

    // Validate productId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid product ID",
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    // Check if product is already in favorites
    const existingFavorite = await Favorite.findOne({
      user: req.user.id,
      product: productId,
    });

    if (existingFavorite) {
      return res.status(400).json({
        success: false,
        error: "Product is already in favorites",
      });
    }

    // Create new favorite
    const favorite = await Favorite.create({
      user: req.user.id,
      product: productId,
      notes: notes || "",
    });

    // Return with populated product
    const populatedFavorite = await Favorite.findById(favorite._id).populate({
      path: "product",
      select: "title slug images price discountedPrice availabilityStatus",
    });

    res.status(201).json({
      success: true,
      data: populatedFavorite,
    });
  } catch (error) {
    // Handle duplicate key error (trying to add the same product twice)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "Product is already in favorites",
      });
    }

    res.status(500).json({
      success: false,
      error: "Server Error: " + error.message,
    });
  }
};

/**
 * @desc    Remove product from favorites
 * @route   DELETE /api/favorites/:productId
 * @access  Private (Authenticated Users)
 */
exports.removeFromFavorites = async (req, res) => {
  try {
    const productId = req.params.productId;

    // Validate productId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid product ID",
      });
    }

    // Find and remove favorite
    const favorite = await Favorite.findOneAndDelete({
      user: req.user.id,
      product: productId,
    });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        error: "Product not found in favorites",
      });
    }

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
 * @desc    Check if a product is in user's favorites
 * @route   GET /api/favorites/check/:productId
 * @access  Private (Authenticated Users)
 */
exports.checkFavoriteStatus = async (req, res) => {
  try {
    const productId = req.params.productId;

    // Validate productId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid product ID",
      });
    }

    // Check if product is in favorites
    const favorite = await Favorite.findOne({
      user: req.user.id,
      product: productId,
    });

    res.status(200).json({
      success: true,
      data: {
        isFavorite: !!favorite,
        favoriteId: favorite ? favorite._id : null,
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
 * @desc    Update favorite notes
 * @route   PUT /api/favorites/:productId
 * @access  Private (Authenticated Users)
 */
exports.updateFavoriteNotes = async (req, res) => {
  try {
    const productId = req.params.productId;
    const { notes } = req.body;

    // Validate productId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid product ID",
      });
    }

    // Find and update favorite
    const favorite = await Favorite.findOneAndUpdate(
      {
        user: req.user.id,
        product: productId,
      },
      { notes },
      { new: true, runValidators: true }
    ).populate({
      path: "product",
      select: "title slug images price discountedPrice availabilityStatus",
    });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        error: "Product not found in favorites",
      });
    }

    res.status(200).json({
      success: true,
      data: favorite,
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
