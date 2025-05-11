// models/ServiceSubcategory.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const ServiceSubcategorySchema = new Schema(
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
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceCategory",
      required: true,
    },
  },
  { timestamps: true }
);

ServiceSubcategorySchema.index(
  { name: 1, parentCategory: 1 },
  { unique: true }
);

module.exports = mongoose.model("ServiceSubcategory", ServiceSubcategorySchema);
