const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        role: {
          type: String,
          enum: ["designer", "assistant", "project_manager", "collaborator"],
          default: "collaborator",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    assignedProjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
teamSchema.index({ createdBy: 1 });
teamSchema.index({ "members.user": 1 });

// Virtual to get member count
teamSchema.virtual("memberCount").get(function () {
  return this.members.length;
});

// Virtual to get project count
teamSchema.virtual("projectCount").get(function () {
  return this.assignedProjects.length;
});

// Method to check if user is team owner
teamSchema.methods.isOwner = function (userId) {
  return this.createdBy.toString() === userId.toString();
};

// Method to check if user is team member
teamSchema.methods.isMember = function (userId) {
  return this.members.some(
    (member) => member.user.toString() === userId.toString()
  );
};

// Method to get member role
teamSchema.methods.getMemberRole = function (userId) {
  const member = this.members.find(
    (member) => member.user.toString() === userId.toString()
  );
  return member ? member.role : null;
};

module.exports = mongoose.model("Team", teamSchema);
