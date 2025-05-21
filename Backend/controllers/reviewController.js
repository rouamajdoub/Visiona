const {
  Review,
  ProjectReview,
  ProductReview,
  AppReview,
} = require("../models/Review");
const { analyzeReview } = require("../utils/analyzeReviewAI");
const mongoose = require("mongoose");

/**
 * Factory function to create reviews for different entities
 * @param {Model} Model - The review model to use
 * @param {String} entityField - The name of the field for the entity being reviewed
 */
const createReviewFactory = (Model, entityField) => async (req, res) => {
  try {
    // Create review object with user ID and request body
    const reviewData = {
      reviewer: req.user._id,
      rating: req.body.rating,
      comment: req.body.comment,
    };

    // Add entity reference if applicable (project, product, etc.)
    if (entityField && req.params.id) {
      reviewData[entityField] = req.params.id;
    }

    // Create the review
    const review = new Model(reviewData);

    // Analyze the review with AI
    review.aiFeedback = await analyzeReview(reviewData);

    // Save the review
    await review.save();

    res.status(201).json({
      success: true,
      data: review,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Factory function to get reviews for different entities
 * @param {Model} Model - The review model to use
 * @param {String} entityField - The name of the field for the entity being reviewed
 */
const getReviewsFactory = (Model, entityField) => async (req, res) => {
  try {
    let query = {};

    // Filter by entity if ID is provided
    if (entityField && req.params.id) {
      query[entityField] = req.params.id;
    }

    // By default only show published reviews to regular users
    if (!req.user || req.user.role !== "admin") {
      query.status = "published";
    }

    const reviews = await Model.find(query)
      .populate("reviewer", "pseudo profilePicture")
      .sort("-createdAt");

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Create review controllers using the factory function
exports.createProjectReview = createReviewFactory(ProjectReview, "project");
exports.createProductReview = createReviewFactory(ProductReview, "product");
exports.createAppReview = createReviewFactory(AppReview);

// Get reviews controllers using the factory function
exports.getProjectReviews = getReviewsFactory(ProjectReview, "project");
exports.getProductReviews = getReviewsFactory(ProductReview, "product");
exports.getAppReviews = getReviewsFactory(AppReview);

/**
 * Get a single review by ID
 */
exports.getReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id).populate(
      "reviewer",
      "pseudo profilePicture"
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        error: "Review not found",
      });
    }

    // Check if review is published or user is admin
    if (
      review.status !== "published" &&
      (!req.user || req.user.role !== "admin")
    ) {
      return res.status(403).json({
        success: false,
        error: "Access denied to this review",
      });
    }

    res.status(200).json({
      success: true,
      data: review,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Update a review's status (admin only)
 */
exports.updateReviewStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;

    if (!["published", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status value",
      });
    }

    // If rejecting, reason is required
    if (status === "rejected" && !rejectionReason) {
      return res.status(400).json({
        success: false,
        error: "Rejection reason is required",
      });
    }

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      {
        status,
        rejectionReason: status === "rejected" ? rejectionReason : undefined,
      },
      { new: true, runValidators: true }
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        error: "Review not found",
      });
    }

    res.status(200).json({
      success: true,
      data: review,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Delete a review (admin only)
 */
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: "Review not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get my reviews (for the logged-in user)
 */
exports.getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewer: req.user._id }).sort(
      "-createdAt"
    );

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get reviews flagged by AI as suspicious (admin only)
 */
exports.getSuspiciousReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      aiFeedback: { $regex: /^suspicious:/ },
    })
      .populate("reviewer", "pseudo profilePicture")
      .sort("-createdAt");

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};
