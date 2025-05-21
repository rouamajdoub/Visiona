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
      width: Number,
      height: Number,
      depth: Number,
      unit: {
        type: String,
        enum: ["cm", "in", "mm", "m"],
        default: "cm",
      },
    },
    weight: {
      value: Number,
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
        name: String,
        value: String,
      },
    ],
    tags: [String],
    isPublished: {
      type: Boolean,
      default: true,
    },
    downloadLink: {
      type: String,
      default: null,
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
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for reviews - works with the discriminator pattern
ProductSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "productId",
  match: { _type: "ProductReview" }, // Only get ProductReview types
  justOne: false,
});

// Set slug before saving
ProductSchema.pre("save", function (next) {
  this.slug = this.title.toLowerCase().replace(/[^a-zA-Z0-9]/g, "-");
  next();
});

// Update avg rating method
ProductSchema.methods.updateAverageRating = async function () {
  const ProductReview = mongoose.model("ProductReview");
  const reviews = await ProductReview.find({ productId: this._id });

  if (reviews.length === 0) {
    this.averageRating = 0;
    this.totalReviews = 0;
  } else {
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    this.averageRating = Math.round((totalRating / reviews.length) * 10) / 10;
    this.totalReviews = reviews.length;
  }

  await this.save();
};

module.exports = mongoose.model("Product", ProductSchema);
