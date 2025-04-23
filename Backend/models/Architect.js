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

    //personal info
    profilePicture: { type: String }, // URL to profile image
    bio: { type: String }, // Paragraph about the architect
    phoneNumber: { type: String },

    //business info
    companyName: { type: String },
    companyLogo: { type: String }, // URL to company logo
    experienceYears: { type: Number },
    specialization: { type: [String] }, // Array of specializations
    specialty: { type: String }, // Primary specialty
    certification: { type: String }, // Primary certification
    isVerified: { type: Boolean, default: false }, // Verification status
    portfolioURL: { type: String },
    certifications: { type: [String] },
    patenteNumber: { type: String, required: true },
    cin: { type: String, required: true },

    //portfolio
    portfolio: [{ type: String }], // Array of image URLs showcasing work

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

    // Languages spoken
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

    // Project types
    projectTypes: [{ type: String }], // e.g., Residential, Commercial, Industrial, etc.

    // Service offerings
    services: [{ type: String }], // e.g., Interior Design, Renovation, New Construction, etc.

    //for the stats
    stats: {
      projects: { type: Number, default: 0 }, // Number of completed projects
      reviews: { type: Number, default: 0 }, // Number of reviews
      earnings: { type: Number, default: 0 }, // Earnings in USD
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
