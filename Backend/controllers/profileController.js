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
      .populate("subscription")
      .select("-__v -authMethod -customerId -priceId");

    if (!architect)
      return res.status(404).json({ error: "Architect not found" });

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

    // Parse JSON strings for nested objects
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
          updateData[field] = JSON.parse(updateData[field]);
        } catch (err) {
          console.warn(`Failed to parse ${field}:`, err);
        }
      }
    });

    // Handle uploaded files
    if (req.files) {
      // Process profile picture
      if (req.files.profilePicture) {
        updateData.profilePicture = `/uploads/profiles/${req.files.profilePicture[0].filename}`;
        console.log("Profile picture path:", updateData.profilePicture);
      }

      // Process company logo
      if (req.files.companyLogo) {
        updateData.companyLogo = `/uploads/profiles/${req.files.companyLogo[0].filename}`;
        console.log("Company logo path:", updateData.companyLogo);
      }

      // Process portfolio images
      if (req.files.portfolio) {
        const portfolioUrls = req.files.portfolio.map(
          (file) => `/uploads/portfolio/${file.filename}`
        );
        console.log("Portfolio URLs:", portfolioUrls);

        const architect = await Architect.findById(req.user.id);
        if (updateData.updatePortfolio === "add" && architect?.portfolio) {
          updateData.portfolio = [...architect.portfolio, ...portfolioUrls];
        } else {
          updateData.portfolio = portfolioUrls;
        }
      }

      // Process documents
      if (req.files.documents) {
        const documentUrls = req.files.documents.map(
          (file) => `/uploads/documents/${file.filename}`
        );
        console.log("Document URLs:", documentUrls);

        const architect = await Architect.findById(req.user.id);
        if (updateData.updateDocuments === "add" && architect?.documents) {
          updateData.documents = [...architect.documents, ...documentUrls];
        } else {
          updateData.documents = documentUrls;
        }
      }

      // Remove the update flags
      delete updateData.updatePortfolio;
      delete updateData.updateDocuments;
    }

    const updatedArchitect = await Architect.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).lean();

    if (!updatedArchitect) {
      return res.status(404).json({ error: "Architect not found" });
    }

    // Convert ObjectId to string for nested populated fields
    if (updatedArchitect.subscription) {
      updatedArchitect.subscription = updatedArchitect.subscription.toString();
    }

    res.json(updatedArchitect);
  } catch (error) {
    console.error("Profile update error:", error.message, error.stack);

    const statusCode = error.name === "ValidationError" ? 400 : 500;
    const response = {
      error: error.message.replace(/ValidationError: /, ""),
      ...(error.errors && {
        details: Object.values(error.errors).map((err) => err.message),
      }),
    };

    res.status(statusCode).json(response);
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
