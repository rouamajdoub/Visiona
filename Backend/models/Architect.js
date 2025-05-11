const mongoose = require("mongoose");
const User = require("./User");

const architectSchema = new mongoose.Schema(
  {
    //auth
    authMethod: {
      type: String,
      default: "local",
      enum: ["local"],
      required: true,
    },
    firstLogin: { type: Boolean, default: false },
    bio: { type: String },
    phoneNumber: { type: String },
    companyName: { type: String },
    experienceYears: { type: Number },
    specialization: { type: [String] },
    specialty: { type: String },
    certification: { type: String },
    isVerified: { type: Boolean, default: false },
    portfolioURL: { type: String },

    //imgs
    portfolio: [{ type: String }], // Array of image URLs showcasing work for the clinet
    companyLogo: { type: String }, // URL to company logo
    profilePicture: { type: String }, // URL to profile image

    //pdf
    certifications: { type: [String] },
    patenteNumber: { type: String, required: true },
    cin: { type: String, required: true },
    education: {
      degree: { type: String },
      institution: String,
      graduationYear: Number,
    },
    softwareProficiency: [
      {
        name: { type: String },
        level: {
          type: String,
          enum: ["Beginner", "Intermediate", "Advanced", "Expert"],
        },
      },
    ],
    location: {
      country: { type: String },
      region: { type: String },
      city: { type: String },
      coordinates: {
        type: { type: String, enum: ["Point"] },
        coordinates: {
          type: [Number],
          validate: {
            validator: function (arr) {
              return arr.length === 2;
            },
            message: "Coordinates must be an array of [longitude, latitude]",
          },
        },
      },
    },
    website: { type: String },
    socialMedia: {
      linkedin: String,
      instagram: String,
      facebook: String,
      twitter: String,
    },
    languages: [
      {
        language: String,
        proficiency: {
          type: String,
          enum: ["Basic", "Intermediate", "Fluent", "Native", "Professional"],
          default: "Intermediate",
        },
      },
    ],
    projectTypes: [{ type: String }], // e.g., Residential, Commercial, Industrial, etc.

    // Updated services field to link with service categories and subcategories
    services: [
      {
        category: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "ServiceCategory",
          required: true,
        },
        subcategories: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ServiceSubcategory",
          },
        ],
        // Additional details about the architect's expertise in this service
        description: { type: String },
        // Cost range for this service (if applicable)
        priceRange: {
          min: { type: Number },
          max: { type: Number },
          currency: { type: String, default: "MAD" },
        },
        // Showcase projects related to this service
        portfolioItems: [
          {
            title: { type: String },
            description: { type: String },
            images: [{ type: String }], // URLs to images
            year: { type: Number },
            location: { type: String },
          },
        ],
      },
    ],

    // AI analyzed service areas (automatically generated based on architect's services)
    serviceAnalysis: {
      primaryExpertise: [{ type: String }],
      secondaryExpertise: [{ type: String }],
      keywordTags: [{ type: String }],
      analysisDate: { type: Date },
      analysisVersion: { type: String },
      confidenceScore: { type: Number, min: 0, max: 1 },
    },

    stats: {
      projects: { type: Number, default: 0 }, // Number of completed projects
      reviews: { type: Number, default: 0 }, // Number of reviews
      views: { type: Number, default: 0 }, // Profile views
    },
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    profileViews: { type: Number, default: 0 },
    profileViewsTimestamps: [{ type: Date }],

    reviews: [
      {
        client: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        comment: { type: String },
        rating: { type: Number },
        date: { type: Date, default: Date.now },
      },
    ],
    //for the clients
    clientsCount: { type: Number, default: 0 },
    clients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ArchitectClient",
      },
    ],
    //subs
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
    },
    subscriptionType: {
      type: String,
      enum: ["Free", "premium", "vip", "none"],
      default: "none",
    },

    //stripe/payment
    customerId: { type: String },
    priceId: { type: String },
    hasAccess: { type: Boolean, default: false },
    emailVerified: { type: Boolean, default: false },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },

    //admin verification
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionDetails: {
      reason: {
        type: String,
        enum: [
          "Incomplete Documentation",
          "Invalid Professional Credentials",
          "Insufficient Portfolio Quality",
          "Duplicate Account",
          "Inappropriate Content",
          "Terms Violation",
          "Other",
        ],
      },
      customReason: { type: String }, // For "Other" or additional details
      rejectedAt: { type: Date },
    },

    documents: [{ type: String }],
    isActive: { type: Boolean, default: true },

    termsAccepted: {
      content: { type: Boolean, default: false },
      cgvCgu: { type: Boolean, default: false },
      privacy: { type: Boolean, default: false },
      lastUpdated: Date,
    },
  },
  { timestamps: true }
);

architectSchema.index({ "location.coordinates": "2dsphere" });

module.exports = User.discriminator("architect", architectSchema);
