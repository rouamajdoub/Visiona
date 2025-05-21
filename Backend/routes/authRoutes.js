const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const fileUpload = require("../middlewares/fileUpload");
// Routes already added from your code

// Add this new route for token verification
router.get("/google/success", authController.handleGoogleLoginSuccess);
// Auth routes
router.post("/register", fileUpload, authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.post("/register-admin", authController.registerAdmin);
router.get("/check", authController.checkAuth);

module.exports = router;
