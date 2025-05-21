const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Create uploads directory if it doesn't exist
const createDirectories = () => {
  const directories = [
    "uploads",
    "uploads/patents",
    "uploads/cin",
    "uploads/profiles",
    "uploads/other",
    "uploads/products", // New directory for product images
  ];
  directories.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Call this function to ensure directories exist
createDirectories();

// Set up storage for different file types
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Determine the destination based on the file type
    if (file.fieldname === "patentFile") {
      cb(null, "uploads/patents");
    } else if (file.fieldname === "cinFile") {
      cb(null, "uploads/cin");
    } else if (file.fieldname === "profilePicture") {
      cb(null, "uploads/profiles");
    } else if (file.fieldname === "productImages") {
      cb(null, "uploads/products");
    } else {
      cb(null, "uploads/other");
    }
  },
  filename: function (req, file, cb) {
    // Create a unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

// File filter function to validate file types
const fileFilter = (req, file, cb) => {
  if (file.fieldname === "patentFile") {
    // Only accept PDFs for patent
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Patent file must be a PDF document"), false);
    }
  } else if (file.fieldname === "cinFile") {
    // Accept images or PDFs for CIN
    if (
      file.mimetype.startsWith("image/") ||
      file.mimetype === "application/pdf"
    ) {
      cb(null, true);
    } else {
      cb(new Error("CIN file must be an image or PDF"), false);
    }
  } else if (
    file.fieldname === "profilePicture" ||
    file.fieldname === "productImages"
  ) {
    // Accept only images for profile pictures and product images
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error(`${file.fieldname} must be an image`), false);
    }
  } else {
    cb(null, true);
  }
};

// Create the multer upload object with all possible fields
// This way we handle all possible files regardless of role
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for files
  },
}).fields([
  { name: "patentFile", maxCount: 1 },
  { name: "cinFile", maxCount: 1 },
  { name: "profilePicture", maxCount: 1 },
  { name: "productImages", maxCount: 5 }, // Allow up to 5 product images
]);

module.exports = upload;
