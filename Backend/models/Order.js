const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
    },
    items: [
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
        },
        price: {
          type: Number,
          required: [true, "Price is required"],
        },
        totalPrice: {
          type: Number,
          required: [true, "Total price is required"],
        },
      },
    ],
    shippingAddress: {
      street: {
        type: String,
        required: [true, "Street address is required"],
      },
      city: {
        type: String,
        required: [true, "City is required"],
      },
      state: {
        type: String,
        required: [true, "State/Province is required"],
      },
      postalCode: {
        type: String,
        required: [true, "Postal code is required"],
      },
      country: {
        type: String,
        required: [true, "Country is required"],
      },
      phoneNumber: {
        type: String,
        required: [true, "Phone number is required"],
      },
    },
    paymentMethod: {
      type: String,
      enum: ["cod"],
      default: "cod", // Cash on delivery
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: ["processing", "shipped", "delivered", "cancelled"],
      default: "processing",
    },
    orderNumber: {
      type: String,
      unique: true,
    },
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
    },
    shippingFee: {
      type: Number,
      default: 0,
    },
    tax: {
      type: Number,
      default: 0,
    },
    deliveryNotes: {
      type: String,
      maxlength: [500, "Delivery notes cannot be more than 500 characters"],
    },
    estimatedDeliveryDate: {
      type: Date,
    },
    trackingInformation: {
      carrier: String,
      trackingNumber: String,
      trackingUrl: String,
    },
  },
  {
    timestamps: true,
  }
);

// Generate order number before saving
OrderSchema.pre("save", function (next) {
  if (!this.orderNumber) {
    // Generate a unique order number: year + month + day + random 4 digits
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);
    const random = Math.floor(1000 + Math.random() * 9000);
    this.orderNumber = `ORD-${year}${month}${day}-${random}`;
  }
  next();
});

// Set products as verified purchases for reviews
OrderSchema.post("save", async function () {
  if (this.orderStatus === "delivered" && this.paymentStatus === "paid") {
    const ProductReview = mongoose.model("ProductReview");

    // Find all reviews by this user for products in this order
    for (const item of this.items) {
      await ProductReview.updateMany(
        {
          user: this.user,
          product: item.product,
        },
        {
          isVerifiedPurchase: true,
        }
      );
    }
  }
});

module.exports = mongoose.model("Order", OrderSchema);
