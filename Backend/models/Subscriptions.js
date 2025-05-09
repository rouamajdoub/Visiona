const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    architectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    plan: {
      type: String,
      enum: ["free", "premium", "vip"],
      required: true,
      default: "free",
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: function () {
        return this.plan !== "free"; // Seulement pour les plans payants
      },
    },
    status: {
      type: String,
      enum: ["active", "expired", "cancelled"],
      default: "active",
    },
    price: {
      type: Number,
      required: function () {
        return this.plan !== "free";
      },
    },
    paymentMethod: {
      type: String,
      enum: ["Card", "PayPal", "Bank Transfer"],
      required: function () {
        return this.plan !== "free";
      },
    },
    transactions: [
      {
        amount: Number,
        date: Date,
        transactionId: String,
        status: {
          type: String,
          enum: ["success", "failed", "pending"],
        },
      },
    ],
  },
  { timestamps: true }
);

const Subscription = mongoose.model("Subscription", subscriptionSchema);
module.exports = Subscription;
