const mongoose = require("mongoose");

const globalOptionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["certification", "software"],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create a compound index for efficient filtering and search
globalOptionSchema.index({ type: 1, name: 1 }, { unique: true });

// Export using this format to ensure proper model definition
module.exports = mongoose.model("GlobalOption", globalOptionSchema);
