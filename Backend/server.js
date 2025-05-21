require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const User = require("./models/User");
const bodyParser = require("body-parser");
const multer = require("multer");
const cities = require("./utils/tunisiaCities.json");
const path = require("path");
const fs = require("fs");

const asyncHandler = require("express-async-handler");
const cookieParser = require("cookie-parser");
const { auth } = require("express-openid-connect");
const passport = require("./config/passport"); // Add passport config
const session = require("express-session"); // Add session middleware
const userRoutes = require("./routes/userRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const projects = require("./routes/projectsRoutes");
const marketplaceRoutes = require("./routes/marketplaceRoutes");
const kanbanRoutes = require("./routes/kanbanRoutes");
const reviewRoutes = require("./routes/reviewsRoutes");
const architectRoutes = require("./routes/architectRoutes");
const statsRoutes = require("./routes/statsRoutes");
const quoteRoutes = require("./routes/QuoteRoutes");
const authRoutes = require("./routes/authRoutes");
const googleAuthRoutes = require("./routes/googleOAuthRoutes"); // Add Google auth routes
const eventRoutes = require("./routes/eventRoutes");
const profileRoutes = require("./routes/profileRoutes");
const clientRoutes = require("./routes/clientRoutes");
const needSheetRoutes = require("./routes/needSheetRoutes");
const adminRoutes = require("./routes/adminRoutes");
const serviceSubcategoryRoutes = require("./routes/serviceSubcategoryRoutes");
const serviceCategoryRoutes = require("./routes/serviceCategoryRoutes");
const analysis = require("./routes/analysis");
const globalOptionRoutes = require("./routes/GlobalOptionRoutes");
const matchingRoutes = require("./routes/matchingRoutes");
require("./config/passport");

// Stripe
const webhookRoutes = require("./Stripe/webhook/route");
const paymentRoutes = require("./routes/paymentRoutes");

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  })
);

// Create uploads directory structure if it doesn't exist
const createUploadDirectories = () => {
  const directories = [
    "uploads",
    "uploads/patents",
    "uploads/cin",
    "uploads/profiles",
    "uploads/other",
  ];

  directories.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });
};

// Call the function to create directories
createUploadDirectories();

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());
app.use(bodyParser.json({ limit: "50mb" }));

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Session middleware (required for Passport)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === "production" },
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Auth0 Configuration
const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.SECRET,
  baseURL: process.env.BASE_URL,
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  issuerBaseURL: process.env.ISSUER_BASE_URL,
  authorizationParams: {
    response_type: "code",
    scope: "openid profile email",
  },
  routes: {
    callback: "/api/auth/callback",
    login: false,
  },
};
app.use(auth(config));

// Connect to Database
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/auth", googleAuthRoutes); // Add Google auth routes
app.use("/api/admins", adminRoutes);

app.use("/api/users", userRoutes);
app.use("/api/clients", userRoutes);
app.use("/api/architects", userRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/arch-req", architectRoutes);
app.use("/api/arch-stats", statsRoutes);
app.use("/api/marketplace", marketplaceRoutes);
app.use("/api/quotes", quoteRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/client-arch", clientRoutes);
app.use("/api/projects", projects);
app.use("/api/kanban", kanbanRoutes);
app.use("/api/admin/service-subcategories", serviceSubcategoryRoutes);
app.use("/api/admin/service-categories", serviceCategoryRoutes);

app.use("/api/global-options", globalOptionRoutes);
app.use("/api/analysis", analysis);
app.use(webhookRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/needsheets", needSheetRoutes);
app.use("/api/matching", matchingRoutes);

// Auth0 callback handling
app.get("/", async (req, res) => {
  if (req.oidc.isAuthenticated()) {
    // Check if Auth0 user exists in the DB
    await ensureUserInDB(req.oidc.user);

    // Redirect to the frontend
    return res.redirect(process.env.FRONTEND_URL);
  } else {
    return res.send("Logged out");
  }
});

// Function to check if user exists in the DB and create if not
const ensureUserInDB = asyncHandler(async (user) => {
  try {
    const existingUser = await User.findOne({ auth0Id: user.sub });

    if (!existingUser) {
      // Create a new user document
      const newUser = new User({
        auth0Id: user.sub,
        email: user.email,
        prenom: user.given_name || "",
        nomDeFamille: user.family_name || "",
        pseudo: user.nickname || user.name,
        profilePicture: user.picture,
        role: "client",
        isVerified: true,
        authMethod: "auth0",
      });

      await newUser.save();
      console.log("User added to DB", user);
    } else {
      console.log("User already exists in DB", existingUser);
    }
  } catch (error) {
    console.log("Error checking or adding user to DB", error.message);
  }
});

// API status endpoint
app.get("/api/status", (req, res) => {
  res.status(200).json({ status: "Server is running" });
});

// Custom error handling middleware for file upload errors
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error("Multer error:", err);

    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        error: `File is too large. Maximum size is 10MB.`,
      });
    } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        error: `Unexpected file field: ${err.field}. Please check that your form has the correct field names.`,
      });
    } else if (err.code === "LIMIT_PART_COUNT") {
      return res.status(400).json({
        success: false,
        error: `Too many parts in the form data.`,
      });
    } else if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        error: `Too many files uploaded for field: ${err.field}.`,
      });
    } else {
      return res.status(400).json({
        success: false,
        error: `File upload error: ${err.message}`,
      });
    }
  } else if (err) {
    console.error("Server error:", err);
    return res.status(500).json({
      success: false,
      error: `Server error: ${err.message}`,
    });
  }
  next();
});

// Global error handler for unhandled errors
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    error: "An unexpected error occurred on the server",
  });
});

// Handle 404 - Route not found
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
  });
});

// Start the Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
