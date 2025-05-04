import mongoose from "mongoose";

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

  // Step 3: Location
  location: {
    country: String,
    region: String,
    city: String,
    postalCode: String,
  },

  // Step 4: Property Details
  totalSurface: { type: Number }, // m²
  workSurface: { type: Number }, // m²
  ownershipStatus: {
    type: String,
    enum: ["Owner", "Renter", "Representative"],
  },

  // Step 5: Services Needed
  serviceTypes: [
    {
      type: String,
      enum: [
        "Consulting",
        "Design",
        "Full Management",
        "Construction Follow-up",
        "Permit Assistance",
        "Other",
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

  // Metadata
  createdAt: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["Pending", "Matched", "In Progress"],
    default: "Pending",
  },
});

export default mongoose.model("NeedSheet", needSheetSchema);
