const User = require("../models/User");
const ServiceCategory = require("../models/ServiceCategory");
const ServiceSubcategory = require("../models/ServiceSubcategory");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const fs = require("fs");
const { getCoordinatesByCityName } = require("../utils/geoHelper");

// Register a new user (client or architect)
// controllers/authController.js - register function
exports.register = async (req, res) => {
  try {
    const {
      pseudo,
      nomDeFamille,
      prenom,
      email,
      password,
      phoneNumber,
      role,
      pays,
      region,
      city,
      patenteNumber,
      companyName,
      experienceYears,
      specialization,
      portfolioURL,
      certifications,
      education,
      softwareProficiency,
      website,
      socialMedia,
      services, // Array of service IDs selected by the architect
    } = req.body;

    console.log("Registration request body:", req.body);
    console.log("Files:", req.files);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // Delete uploaded files if email already exists
      if (req.files) {
        Object.values(req.files).forEach((fileArray) => {
          fileArray.forEach((file) => {
            fs.unlink(file.path, (err) => {
              if (err) console.error("Error deleting file:", err);
            });
          });
        });
      }
      return res.status(400).json({ error: "Email déjà utilisé" });
    }

    if (role === "architect") {
      // Validate required fields for architects
      if (!patenteNumber) {
        return res.status(400).json({
          error: "Patente Number is required for architects.",
        });
      }

      // Validate that files were uploaded for architects
      if (!req.files || !req.files.patentFile || !req.files.cinFile) {
        return res.status(400).json({
          error: "Patent PDF and CIN image are required for architects.",
        });
      }

      // Validate password
      if (!password || password.length < 8) {
        return res.status(400).json({
          error: "Password must be at least 8 characters long.",
        });
      }

      // Validate services if provided
      if (services && services.length > 0) {
        // Parse services if it's a string (form data can send arrays as strings)
        const serviceArray =
          typeof services === "string" ? JSON.parse(services) : services;

        // Verify that all selected services exist in the database
        for (const serviceItem of serviceArray) {
          const { category, subcategories } = serviceItem;

          // Check if the category exists
          const categoryExists = await ServiceCategory.findById(category);
          if (!categoryExists) {
            return res.status(400).json({
              error: `Service category with ID ${category} does not exist.`,
            });
          }

          // Check if subcategories exist (if provided)
          if (subcategories && subcategories.length > 0) {
            for (const subcatId of subcategories) {
              const subcategoryExists = await ServiceSubcategory.findOne({
                _id: subcatId,
                category: category,
              });

              if (!subcategoryExists) {
                return res.status(400).json({
                  error: `Service subcategory with ID ${subcatId} does not exist or does not belong to the specified category.`,
                });
              }
            }
          }
        }
      }
    }

    // Get coordinates from city name
    // If city is provided, try to get coordinates for it
    let geoCoordinates = null;
    if (city) {
      geoCoordinates = getCoordinatesByCityName(city);

      if (!geoCoordinates && region) {
        // Try with the region as a fallback if city coordinates not found
        geoCoordinates = getCoordinatesByCityName(region);
      }
    } else if (region) {
      // If only region is provided, try to get coordinates for it
      geoCoordinates = getCoordinatesByCityName(region);
    }

    // Default coordinates if nothing is found
    if (!geoCoordinates) {
      geoCoordinates = { type: "Point", coordinates: [10.1815, 36.8065] }; // Default to Tunis coordinates
    }

    const userData = {
      pseudo,
      nomDeFamille,
      prenom,
      email,
      password,
      phoneNumber: phoneNumber || "",
      role,
      authMethod: "local",
      contentTerm: req.body.contentTerm || false,
      cgvAndCguTerm: req.body.cgvAndCguTerm || false,
      infoTerm: req.body.infoTerm || false,
      majorTerm: req.body.majorTerm || false,
      exterieurParticipantTerm: req.body.exterieurParticipantTerm || false,
      isVerified: true, // Auto-verify all users
    };

    if (role === "client") {
      userData.location = {
        country: pays || req.body.location?.country || "Tunisia",
        region: region || req.body.location?.region || "",
        city: city || req.body.location?.city || "",
        coordinates: geoCoordinates,
      };
      // Add profile picture if uploaded
      if (req.files && req.files.profilePicture) {
        userData.profilePicture = req.files.profilePicture[0].path;
      }
    } else if (role === "architect") {
      // Add paths to uploaded files
      const patentFilePath = req.files.patentFile[0].path;
      const cinFilePath = req.files.cinFile[0].path;

      userData.patenteFile = patentFilePath;
      userData.cinFile = cinFilePath;
      userData.patenteNumber = patenteNumber;
      userData.companyName = companyName || "";
      userData.experienceYears = experienceYears || 0;
      userData.specialization = Array.isArray(specialization)
        ? specialization
        : [specialization || ""];
      userData.portfolioURL = portfolioURL || "";
      userData.certifications = Array.isArray(certifications)
        ? certifications
        : certifications
        ? [certifications]
        : [];
      userData.education = education || "";

      // Parse softwareProficiency if it's a string
      if (softwareProficiency) {
        userData.softwareProficiency =
          typeof softwareProficiency === "string"
            ? JSON.parse(softwareProficiency)
            : softwareProficiency;
      } else {
        userData.softwareProficiency = [];
      }

      userData.website = website || "";
      userData.socialMedia = socialMedia || {};
      userData.status = "pending";
      userData.location = {
        country: pays || "Tunisia", // Default to Tunisia if not provided
        region: region || "",
        city: city || "",
        coordinates: geoCoordinates,
      };

      // Add profile picture if uploaded
      if (req.files && req.files.profilePicture) {
        userData.profilePicture = req.files.profilePicture[0].path;
      }

      // Add services if provided
      if (services && services.length > 0) {
        // Parse services if it's a string (form data can send arrays as strings)
        const serviceArray =
          typeof services === "string" ? JSON.parse(services) : services;
        userData.services = serviceArray;
      } else {
        userData.services = [];
      }
    }

    const user = new User(userData);
    await user.save();

    res.status(201).json({
      success: true,
      message: "Compte créé avec succès.",
    });
  } catch (error) {
    console.error("Registration error:", error);

    // Delete uploaded files in case of error
    if (req.files) {
      Object.values(req.files).forEach((fileArray) => {
        fileArray.forEach((file) => {
          fs.unlink(file.path, (err) => {
            if (err) console.error("Error deleting file:", err);
          });
        });
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || "An error occurred during registration",
    });
  }
};

// Admin Registration
exports.registerAdmin = asyncHandler(async (req, res) => {
  try {
    const {
      pseudo,
      nomDeFamille,
      prenom,
      email,
      password,
      phoneNumber,
      adminPrivileges,
      superAdmin,
      adminSecretKey,
      location, // Extract location from request body
    } = req.body;

    // Verify admin secret key to prevent unauthorized admin creation
    if (adminSecretKey !== process.env.ADMIN_SECRET_KEY) {
      return res.status(403).json({
        success: false,
        error: "Invalid admin secret key. Admin creation not authorized.",
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email déjà utilisé" });
    }

    // Password validation
    if (!password || password.length < 8) {
      return res.status(400).json({
        error: "Password must be at least 8 characters long.",
      });
    }

    // Create admin user
    const adminData = {
      pseudo,
      nomDeFamille,
      prenom,
      email,
      password,
      phoneNumber: phoneNumber || "",
      role: "admin",
      authMethod: "local",
      isVerified: true,
      adminPrivileges: adminPrivileges || ["content-moderation"],
      superAdmin: superAdmin || false,
      isActive: true,
      location, // Add location to adminData
    };

    const admin = new User(adminData);
    await admin.save();

    // Rest of the function remains the same
    // ...
  } catch (error) {
    console.error("Admin registration error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "An error occurred during admin registration",
    });
  }
});

// Update your login function to handle admin login
exports.login = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt for:", email);

    const user = await User.findOne({ email }).select("+password");
    console.log("User found:", user ? "Yes" : "No");

    if (!user) {
      console.log("User not found with email:", email);
      return res
        .status(401)
        .json({ success: false, error: "Email or password incorrect" });
    }

    console.log("User role:", user.role);
    console.log("User status:", user.status);
    console.log("Auth method:", user.authMethod);

    if (user.authMethod === "auth0") {
      console.log("Auth0 login attempt - redirecting to Auth0");
      return res.status(401).json({
        success: false,
        error: "Please use Auth0 to log in",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match:", isMatch);

    if (!isMatch) {
      console.log("Password mismatch for user:", email);
      return res
        .status(401)
        .json({ success: false, error: "Email ou mot de passe incorrect" });
    }

    // Extra check for architects
    if (user.role === "architect") {
      if (user.status === "rejected") {
        console.log("Architect was rejected.");
        return res.status(403).json({
          success: false,
          error: "Access denied: Your application was rejected by the admin.",
        });
      }

      if (user.status !== "approved") {
        console.log("Architect not approved. Status:", user.status);
        return res.status(401).json({
          success: false,
          error: "Account pending approval",
        });
      }
    }

    // Extra check for admins
    if (user.role === "admin" && !user.isActive) {
      console.log("Admin account inactive");
      return res.status(401).json({
        success: false,
        error: "Admin account inactive",
      });
    }

    // Check if this is the first login
    const isFirstLogin = !user.firstLogin;
    console.log("Is first login:", isFirstLogin);

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    user.authTokens.push({ token });

    // Only update firstLogin after successful authentication
    if (isFirstLogin) {
      user.firstLogin = true;
    }

    await user.save();
    console.log("User saved with token");

    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.authTokens;

    res.status(200).json({
      success: true,
      token,
      user: userObject,
      isFirstLogin: isFirstLogin,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "An error occurred during login",
    });
  }
});
// Add this to your authController.js file, keeping all existing code

// Handle Google login success
exports.handleGoogleLoginSuccess = asyncHandler(async (req, res) => {
  try {
    const { token, userId } = req.query;

    if (!token || !userId) {
      return res.status(400).json({
        success: false,
        error: "Missing token or user ID",
      });
    }

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Check if this is the first login
    const isFirstLogin = !user.firstLogin;

    // Update firstLogin flag if needed
    if (isFirstLogin) {
      user.firstLogin = true;
      await user.save();
    }

    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.authTokens;

    res.status(200).json({
      success: true,
      token,
      user: userObject,
      isFirstLogin: isFirstLogin,
    });
  } catch (error) {
    console.error("Google login success handling error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "An error occurred during login",
    });
  }
});

// Update checkAuth to include Google authentication
exports.checkAuth = asyncHandler(async (req, res) => {
  if (req.oidc?.isAuthenticated()) {
    const user = await User.findOne({
      auth0Id: req.oidc.user.sub,
      authMethod: "auth0",
    });
    return res.json({ isAuthenticated: true, authMethod: "auth0", user });
  }

  const authHeader = req.header("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    try {
      const token = authHeader.replace("Bearer ", "");
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (user) {
        // Check if the user is authenticated via Google
        const isGoogleAuth = user.authMethod === "google";

        return res.json({
          isAuthenticated: true,
          authMethod: isGoogleAuth ? "google" : "jwt",
          user,
        });
      }
    } catch (error) {
      // Invalid token
    }
  }

  res.json({ isAuthenticated: false, user: {} });
});
// Get Profile
exports.getProfile = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Find user by ID or auth0Id
    const user = await User.findOne({
      $or: [{ _id: id }, { auth0Id: id }],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return user profile (excluding sensitive data)
    const userProfile = user.toObject();
    delete userProfile.password;
    delete userProfile.authTokens;

    return res.status(200).json(userProfile);
  } catch (error) {
    console.log("Error in getProfile: ", error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

// Logout
exports.logout = asyncHandler(async (req, res) => {
  if (req.oidc?.isAuthenticated()) {
    return res.oidc.logout({ returnTo: process.env.FRONTEND_URL });
  }

  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

    user.authTokens = user.authTokens.filter((t) => t.token !== token);
    await user.save();

    res.json({ success: true, message: "Déconnexion réussie" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check Auth Status
exports.checkAuth = asyncHandler(async (req, res) => {
  if (req.oidc?.isAuthenticated()) {
    const user = await User.findOne({
      auth0Id: req.oidc.user.sub,
      authMethod: "auth0",
    });
    return res.json({ isAuthenticated: true, authMethod: "auth0", user });
  }

  const authHeader = req.header("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    try {
      const token = authHeader.replace("Bearer ", "");
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (user)
        return res.json({ isAuthenticated: true, authMethod: "jwt", user });
    } catch (error) {
      // Invalid token
    }
  }

  res.json({ isAuthenticated: false, user: {} });
});
