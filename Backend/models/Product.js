// models/Product.js
const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Product title is required"],
      trim: true,
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
      maxlength: [2000, "Description cannot be more than 2000 characters"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    discountedPrice: {
      type: Number,
      default: 0,
      min: [0, "Discounted price cannot be negative"],
      validate: {
        validator: function (value) {
          return value <= this.price;
        },
        message: "Discounted price cannot be greater than original price",
      },
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        alt: {
          type: String,
          default: "Product image",
        },
        isPrimary: {
          type: Boolean,
          default: false,
        },
      },
    ],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Seller reference is required"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0, "Quantity cannot be negative"],
      default: 0,
    },
    type: {
      type: String,
      enum: ["physical", "digital"],
      required: [true, "Product type is required"],
    },
    dimensions: {
      width: {
        type: Number,
        min: [0, "Width cannot be negative"],
      },
      height: {
        type: Number,
        min: [0, "Height cannot be negative"],
      },
      depth: {
        type: Number,
        min: [0, "Depth cannot be negative"],
      },
      unit: {
        type: String,
        enum: ["cm", "in", "mm", "m"],
        default: "cm",
      },
    },
    weight: {
      value: {
        type: Number,
        min: [0, "Weight cannot be negative"],
      },
      unit: {
        type: String,
        enum: ["kg", "g", "lb", "oz"],
        default: "kg",
      },
    },
    availabilityStatus: {
      type: String,
      enum: ["inStock", "outOfStock", "preOrder", "discontinued"],
      default: "inStock",
    },
    specifications: [
      {
        name: {
          type: String,
          required: true,
        },
        value: {
          type: String,
          required: true,
        },
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    isPublished: {
      type: Boolean,
      default: true,
    },
    downloadLink: {
      type: String,
      default: null,
      validate: {
        validator: function (value) {
          if (this.type === "digital" && this.isPublished) {
            return value && value.length > 0;
          }
          return true;
        },
        message: "Download link is required for published digital products",
      },
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for reviews - fixed to match the discriminator pattern
ProductSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "product",
  match: { reviewType: "ProductReview" },
  justOne: false,
});

// Virtual for discounted price percentage
ProductSchema.virtual("discountPercentage").get(function () {
  if (this.discountedPrice > 0 && this.discountedPrice < this.price) {
    return Math.round(((this.price - this.discountedPrice) / this.price) * 100);
  }
  return 0;
});

// Virtual for effective price (discounted or regular)
ProductSchema.virtual("effectivePrice").get(function () {
  return this.discountedPrice > 0 ? this.discountedPrice : this.price;
});

// Set slug before saving
ProductSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .replace(/\s+/g, "-");
  }

  // Ensure only one primary image
  if (this.images && this.images.length > 0) {
    let primaryCount = 0;
    this.images.forEach((image, index) => {
      if (image.isPrimary) {
        primaryCount++;
        if (primaryCount > 1) {
          image.isPrimary = false;
        }
      }
    });

    // If no primary image is set, make the first one primary
    if (primaryCount === 0) {
      this.images[0].isPrimary = true;
    }
  }

  next();
});

// Update availability status based on quantity
ProductSchema.pre("save", function (next) {
  if (this.type === "physical") {
    if (this.quantity === 0 && this.availabilityStatus === "inStock") {
      this.availabilityStatus = "outOfStock";
    } else if (this.quantity > 0 && this.availabilityStatus === "outOfStock") {
      this.availabilityStatus = "inStock";
    }
  }
  next();
});

// Update average rating method
ProductSchema.methods.updateAverageRating = async function () {
  const ProductReview = mongoose.model("ProductReview");
  const reviews = await ProductReview.find({
    product: this._id,
    status: "published",
  });

  if (reviews.length === 0) {
    this.averageRating = 0;
    this.totalReviews = 0;
  } else {
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    this.averageRating = Math.round((totalRating / reviews.length) * 10) / 10;
    this.totalReviews = reviews.length;
  }

  return this.save();
};

// Indexes for better performance
ProductSchema.index({ seller: 1 });
ProductSchema.index({ category: 1 });
ProductSchema.index({ slug: 1 });
ProductSchema.index({ title: "text", description: "text", tags: "text" });
ProductSchema.index({ price: 1 });
ProductSchema.index({ averageRating: -1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ isPublished: 1 });

module.exports = mongoose.model("Product", ProductSchema);
