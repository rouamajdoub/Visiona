const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema({
  needsheetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "NeedSheet",
    required: true,
  },
  matches: [
    {
      architectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Architect",
        required: true,
      },
      score: Number,
      reason: String,
      status: {
        type: String,
        enum: [
          "pending",
          "accepted_by_client",
          "accepted_by_architect",
          "fully_accepted",
          "rejected",
        ],
        default: "pending",
      },
      approval: {
        client: {
          type: Boolean,
          default: false,
        },
        architect: {
          type: Boolean,
          default: false,
        },
      },
      responseDate: Date,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Match", matchSchema);
