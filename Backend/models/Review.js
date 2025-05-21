const mongoose = require("mongoose");

const baseReviewOptions = {
  discriminatorKey: "reviewType",
  timestamps: true,
};

const reviewSchema = new mongoose.Schema(
  {
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["published", "rejected"],
      default: "published",
    },
    aiFeedback: { type: String },
    rejectionReason: { type: String },
    usersWhoFoundHelpful: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    helpfulVotes: {
      type: Number,
      default: 0,
    },
  },

  baseReviewOptions
);

const Review = mongoose.model("Review", reviewSchema);

// Discriminators
const ProjectReview = Review.discriminator(
  "ProjectReview",
  new mongoose.Schema({
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
  })
);

const ProductReview = Review.discriminator(
  "ProductReview",
  new mongoose.Schema({
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
  })
);

const AppReview = Review.discriminator("AppReview", new mongoose.Schema({}));

module.exports = {
  Review,
  ProjectReview,
  ProductReview,
  AppReview,
};
