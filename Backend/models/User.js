const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    pseudo: { type: String, trim: true },
    nomDeFamille: { type: String, trim: true },
    prenom: { type: String, trim: true },
    email: { type: String, unique: true, lowercase: true },
    password: { type: String, minlength: 8, select: false },
    profilePicture: { type: String },
    phoneNumber: { type: String },

    // Auth methods
    auth0Id: { type: String },
    googleId: { type: String }, // Add Google ID field
    authMethod: {
      type: String,
      enum: ["auth0", "local", "google"], // Add "google" to auth methods
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "architect", "client"],
      default: "client",
    },
    location: {
      country: { type: String, default: "Tunisia" },
      region: { type: String },
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
    isVerified: { type: Boolean, default: false },
    emailToken: { type: String },

    // Terms & Conditions
    contentTerm: { type: Boolean, default: false },
    cgvAndCguTerm: { type: Boolean, default: false },
    infoTerm: { type: Boolean, default: false },
    majorTerm: { type: Boolean, default: false },
    exterieurParticipantTerm: { type: Boolean, default: false },

    authTokens: [
      {
        token: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    firstLogin: { type: Boolean, default: false }, // Track first login
  },
  { timestamps: true, discriminatorKey: "role" }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (password) {
  if (!this.password) return false;
  return await bcrypt.compare(password, this.password);
};

// Fixed token storage and comparison method
userSchema.methods.generateAuthToken = async function () {
  const token = jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );

  // Store the raw token
  this.authTokens.push({ token, createdAt: Date.now() });

  // Cleanup old tokens (older than 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  this.authTokens = this.authTokens.filter((t) => t.createdAt > thirtyDaysAgo);

  await this.save();
  return token;
};

// Compare token method
userSchema.methods.compareToken = function (token) {
  return this.authTokens.some((tokenObj) => tokenObj.token === token);
};

// Remove password and auth tokens from user object
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.authTokens;
  return user;
};

userSchema.index({ "location.coordinates": "2dsphere" });
userSchema.index({ googleId: 1 }, { sparse: true }); // Add index for googleId

const User = mongoose.model("User", userSchema);
module.exports = User;
