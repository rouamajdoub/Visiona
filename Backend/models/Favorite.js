const mongoose = require("mongoose");

const FavoriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
    },
    // Updated to support both products and architects
    favoriteType: {
      type: String,
      enum: ["product", "architect"],
      required: [true, "Favorite type is required"],
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: function () {
        return this.favoriteType === "product";
      },
    },
    architect: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // References architect users
      required: function () {
        return this.favoriteType === "architect";
      },
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      maxlength: [500, "Notes cannot be more than 500 characters"],
    },
  },
  { timestamps: true }
);

// Compound indexes to ensure uniqueness and optimize queries
FavoriteSchema.index(
  { user: 1, product: 1 },
  {
    unique: true,
    partialFilterExpression: { favoriteType: "product" },
  }
);

FavoriteSchema.index(
  { user: 1, architect: 1 },
  {
    unique: true,
    partialFilterExpression: { favoriteType: "architect" },
  }
);

// Index for efficient querying by user and type
FavoriteSchema.index({ user: 1, favoriteType: 1 });

// Virtual to get the favorited item regardless of type
FavoriteSchema.virtual("favoriteItem", {
  refPath: function () {
    return this.favoriteType === "product" ? "product" : "architect";
  },
  localField: function () {
    return this.favoriteType === "product" ? "product" : "architect";
  },
  foreignField: "_id",
  justOne: true,
});

// Ensure virtuals are included in JSON output
FavoriteSchema.set("toJSON", { virtuals: true });
FavoriteSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Favorite", FavoriteSchema);
