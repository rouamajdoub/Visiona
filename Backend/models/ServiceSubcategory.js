// models/ServiceSubcategory.js
const mongoose = require("mongoose");

const ServiceSubcategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    parentCategory: {
      // ✅ Match database field name
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceCategory",
      required: true,
    },
  },
  { timestamps: true }
);

// Create a compound index to ensure unique subcategories within a category
ServiceSubcategorySchema.index(
  { name: 1, parentCategory: 1 },
  { unique: true }
);

module.exports = mongoose.model("ServiceSubcategory", ServiceSubcategorySchema);
