const mongoose = require("mongoose");

const CartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product reference is required"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
      default: 1,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
    },
    // Save current product details in case product changes later
    productSnapshot: {
      title: String,
      image: String,
      type: {
        type: String,
        enum: ["physical", "digital"],
      },
    },
  },
  { timestamps: true }
);

const CartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      unique: true,
    },
    items: [CartItemSchema],
    totalAmount: {
      type: Number,
      default: 0,
    },
    itemCount: {
      type: Number,
      default: 0,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Calculate totals before saving
CartSchema.pre("save", async function (next) {
  // Calculate total amount
  this.totalAmount = this.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Calculate item count
  this.itemCount = this.items.reduce((count, item) => count + item.quantity, 0);

  // Update last active timestamp
  this.lastActive = Date.now();

  next();
});

module.exports = mongoose.model("Cart", CartSchema);
