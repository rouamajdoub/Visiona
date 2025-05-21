const mongoose = require("mongoose");

const needSheetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Who submitted the needsheet

  // Step 1: Project Type
  projectTypes: [
    {
      type: String,
      enum: [
        "Renovation",
        "Construction",
        "Interior Arrangement",
        "Extension",
        "Superstructure",
        "Exterior Arrangement",
        "Other",
      ],
    },
  ],

  // Step 2: Property Type
  propertyType: {
    type: String,
    enum: [
      "Apartment",
      "House",
      "Commercial Space",
      "Professional Building",
      "Other",
    ],
  },

  // Step 3: Location - Structured like User model
  location: {
    country: String,
    region: String,
    city: String,
    coordinates: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },
  },

  // Step 4: Property Details
  totalSurface: { type: Number }, // m²
  workSurface: { type: Number }, // m²
  ownershipStatus: {
    type: String,
    enum: ["Owner", "Renter", "Representative"],
  },

  // Step 5: Services Needed - Updated to link to ServiceCategory and ServiceSubcategory
  services: [
    {
      category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ServiceCategory",
        required: true,
      },
      subcategories: [
        { type: mongoose.Schema.Types.ObjectId, ref: "ServiceSubcategory" },
      ],
    },
  ],

  // Step 6: Timeline
  startTime: {
    type: String,
    enum: ["ASAP", "1-3 months", "6 months", "Flexible"],
  },
  deadline: { type: Date }, // optional

  // Step 7: Description
  projectDescription: { type: String, maxlength: 2000 },
  budget: {
    min: Number,
    max: Number,
  },
  // Metadata
  createdAt: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["Pending", "Matched", "In Progress"],
    default: "Pending",
  },
});

// Add index for geospatial queries
needSheetSchema.index({ "location.coordinates": "2dsphere" });

module.exports = mongoose.model("NeedSheet", needSheetSchema);
