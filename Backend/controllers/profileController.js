const Architect = require("../models/Architect");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs");
// Ensure upload directories exist
const createDirectoryIfNotExists = (dirPath) => {
  const fullPath = path.join(__dirname, "..", dirPath);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`Created directory: ${fullPath}`);
  }
};

// Create necessary directories
createDirectoryIfNotExists("uploads");
createDirectoryIfNotExists("uploads/profiles");
createDirectoryIfNotExists("uploads/portfolio");
createDirectoryIfNotExists("uploads/documents");

// Configure storage for profile images and portfolio
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = path.join(__dirname, "..", "uploads/");

    if (
      file.fieldname === "profilePicture" ||
      file.fieldname === "companyLogo"
    ) {
      uploadPath = path.join(uploadPath, "profiles/");
    } else if (file.fieldname === "portfolio") {
      uploadPath = path.join(uploadPath, "portfolio/");
    } else if (file.fieldname === "documents") {
      uploadPath = path.join(uploadPath, "documents/");
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  },
});

// Filter for allowed file types
const fileFilter = (req, file, cb) => {
  // Check file types based on fieldname
  if (
    file.fieldname === "profilePicture" ||
    file.fieldname === "companyLogo" ||
    file.fieldname === "portfolio"
  ) {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  } else if (file.fieldname === "documents") {
    if (
      file.mimetype === "application/pdf" ||
      file.mimetype.startsWith("image/")
    ) {
      cb(null, true);
    } else {
      cb(
        new Error("Only PDF and image files are allowed for documents!"),
        false
      );
    }
  } else {
    cb(null, true);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Middleware to handle file uploads
exports.uploadFiles = upload.fields([
  { name: "profilePicture", maxCount: 1 },
  { name: "companyLogo", maxCount: 1 },
  { name: "portfolio", maxCount: 10 },
  { name: "documents", maxCount: 5 },
]);

// Get the authenticated architect's profile
exports.getMyProfile = async (req, res) => {
  try {
    const architect = await Architect.findById(req.user.id)
      .populate("subscription", "name price features") // Only populate needed fields
      .select(
        "-__v -authMethod -customerId -priceId -password -resetPasswordToken -resetPasswordExpires"
      )
      .lean(); // Use lean() for better performance

    if (!architect) {
      return res.status(404).json({ error: "Architect not found" });
    }

    // Ensure file URLs are properly formatted
    if (
      architect.profilePicture &&
      !architect.profilePicture.startsWith("http")
    ) {
      architect.profilePicture = `${req.protocol}://${req.get("host")}/${
        architect.profilePicture
      }`;
    }

    if (architect.companyLogo && !architect.companyLogo.startsWith("http")) {
      architect.companyLogo = `${req.protocol}://${req.get("host")}/${
        architect.companyLogo
      }`;
    }

    // Format portfolio URLs
    if (architect.portfolio && Array.isArray(architect.portfolio)) {
      architect.portfolio = architect.portfolio.map((url) =>
        url.startsWith("http")
          ? url
          : `${req.protocol}://${req.get("host")}/${url}`
      );
    }

    res.json(architect);
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

// Update the authenticated architect's profile
exports.updateMyProfile = async (req, res) => {
  try {
    const updateData = { ...req.body };

    // Validate required fields if they're being updated
    const requiredFields = ["patenteNumber"];
    for (const field of requiredFields) {
      if (updateData[field] !== undefined && !updateData[field]) {
        return res.status(400).json({
          error: `${field} is required and cannot be empty`,
        });
      }
    }

    // Parse JSON strings for nested objects with better error handling
    const fieldsToParse = [
      "education",
      "location",
      "socialMedia",
      "softwareProficiency",
      "languages",
      "companyHistory",
    ];

    fieldsToParse.forEach((field) => {
      if (updateData[field] && typeof updateData[field] === "string") {
        try {
          const parsed = JSON.parse(updateData[field]);
          updateData[field] = parsed;
        } catch (err) {
          console.warn(`Failed to parse ${field}:`, err);
          // Remove invalid JSON to prevent database errors
          delete updateData[field];
        }
      }
    });

    // Enhanced location validation
    if (updateData.location) {
      const location = updateData.location;

      // Validate coordinates if provided
      if (location.coordinates) {
        if (typeof location.coordinates === "string") {
          try {
            location.coordinates = JSON.parse(location.coordinates);
          } catch (err) {
            console.warn("Failed to parse coordinates:", err);
            delete location.coordinates;
          }
        }

        if (Array.isArray(location.coordinates)) {
          const [lng, lat] = location.coordinates;
          if (
            location.coordinates.length === 2 &&
            typeof lng === "number" &&
            typeof lat === "number" &&
            lng >= -180 &&
            lng <= 180 &&
            lat >= -90 &&
            lat <= 90 &&
            !isNaN(lng) &&
            !isNaN(lat)
          ) {
            // Coordinates are valid
          } else {
            console.warn("Invalid coordinates:", location.coordinates);
            delete location.coordinates;
          }
        } else if (location.coordinates !== undefined) {
          delete location.coordinates;
        }
      }

      // Validate required location fields
      if (location.country && location.country.trim() === "") {
        delete location.country;
      }
      if (location.city && location.city.trim() === "") {
        delete location.city;
      }
    }

    // Handle uploaded files with better error handling
    if (req.files) {
      const baseUrl = `${req.protocol}://${req.get("host")}`;

      try {
        // Process profile picture
        if (req.files.profilePicture) {
          const filename = req.files.profilePicture[0].filename;
          updateData.profilePicture = `uploads/profiles/${filename}`;
          console.log("Profile picture updated:", updateData.profilePicture);
        }

        // Process company logo
        if (req.files.companyLogo) {
          const filename = req.files.companyLogo[0].filename;
          updateData.companyLogo = `uploads/profiles/${filename}`;
          console.log("Company logo updated:", updateData.companyLogo);
        }

        // Process portfolio images
        if (req.files.portfolio) {
          const portfolioUrls = req.files.portfolio.map(
            (file) => `uploads/portfolio/${file.filename}`
          );
          console.log("New portfolio URLs:", portfolioUrls);

          // Handle portfolio update mode
          if (updateData.updatePortfolio === "add") {
            const architect = await Architect.findById(req.user.id).select(
              "portfolio"
            );
            if (architect?.portfolio && Array.isArray(architect.portfolio)) {
              updateData.portfolio = [...architect.portfolio, ...portfolioUrls];
            } else {
              updateData.portfolio = portfolioUrls;
            }
          } else {
            updateData.portfolio = portfolioUrls;
          }
        }

        // Process documents
        if (req.files.documents) {
          const documentUrls = req.files.documents.map(
            (file) => `uploads/documents/${file.filename}`
          );
          console.log("New document URLs:", documentUrls);

          // Handle document update mode
          if (updateData.updateDocuments === "add") {
            const architect = await Architect.findById(req.user.id).select(
              "documents"
            );
            if (architect?.documents && Array.isArray(architect.documents)) {
              updateData.documents = [...architect.documents, ...documentUrls];
            } else {
              updateData.documents = documentUrls;
            }
          } else {
            updateData.documents = documentUrls;
          }
        }

        // Clean up temporary flags
        delete updateData.updatePortfolio;
        delete updateData.updateDocuments;
      } catch (fileError) {
        console.error("File processing error:", fileError);
        return res.status(400).json({
          error: "Failed to process uploaded files",
        });
      }
    }

    // Update the architect profile
    const updatedArchitect = await Architect.findByIdAndUpdate(
      req.user.id,
      updateData,
      {
        new: true,
        runValidators: true,
        context: "query", // Ensure validation runs properly
      }
    )
      .populate("subscription", "name price features")
      .select("-__v -authMethod -customerId -priceId -password")
      .lean();

    if (!updatedArchitect) {
      return res.status(404).json({ error: "Architect not found" });
    }

    res.json(updatedArchitect);
  } catch (error) {
    console.error("Profile update error:", error);

    // Enhanced error handling
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map((err) => ({
        field: err.path,
        message: err.message,
        value: err.value,
      }));

      return res.status(400).json({
        error: "Validation failed",
        details: validationErrors,
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        error: `Invalid value for field: ${error.path}`,
      });
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        error: `${field} already exists. Please use a different value.`,
      });
    }

    res.status(500).json({
      error: "Failed to update profile. Please try again.",
    });
  }
};

// Delete portfolio items
exports.deletePortfolioItem = async (req, res) => {
  try {
    const { itemIndex } = req.params;

    const architect = await Architect.findById(req.user.id);
    if (!architect) {
      return res.status(404).json({ error: "Architect not found" });
    }

    if (!architect.portfolio || itemIndex >= architect.portfolio.length) {
      return res.status(400).json({ error: "Portfolio item not found" });
    }

    // Remove the portfolio item
    architect.portfolio.splice(itemIndex, 1);
    await architect.save();

    res.json({
      message: "Portfolio item deleted successfully",
      portfolio: architect.portfolio,
    });
  } catch (error) {
    console.error("Delete portfolio item error:", error);
    res.status(500).json({ error: "Failed to delete portfolio item" });
  }
};

// Delete the authenticated architect's profile
exports.deleteMyProfile = async (req, res) => {
  try {
    const deletedArchitect = await Architect.findByIdAndDelete(req.user.id);
    if (!deletedArchitect)
      return res.status(404).json({ error: "Architect not found" });

    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete account" });
  }
};

// Get architect stats (profile views, ratings, review count)
exports.getMyStats = async (req, res) => {
  try {
    const architect = await Architect.findById(req.user.id);
    if (!architect)
      return res.status(404).json({ error: "Architect not found" });

    res.json({
      profileViews: architect.profileViews || 0,
      totalReviews: architect.reviews?.length || 0,
      averageRating: architect.rating?.average || 0,
      projects: architect.stats?.projects || 0,
      earnings: architect.stats?.earnings || 0,
      views: architect.stats?.views || 0,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
};

// Change payment status (for subscription)
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    if (!["pending", "completed"].includes(paymentStatus)) {
      return res.status(400).json({ error: "Invalid payment status" });
    }

    const architect = await Architect.findById(req.user.id);
    if (!architect)
      return res.status(404).json({ error: "Architect not found" });

    if (!architect.subscription) {
      return res.status(400).json({ error: "No active subscription found" });
    }

    architect.paymentStatus = paymentStatus;
    await architect.save();

    res.json({ message: "Payment status updated", architect });
  } catch (error) {
    res.status(500).json({ error: "Failed to update payment status" });
  }
};
