const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Test route to verify configuration
router.get("/test-config", (req, res) => {
  res.json({
    message: "OAuth configuration test",
    clientId: process.env.GOOGLE_CLIENT_ID,
    hasSecret: !!process.env.AUTH_GOOGLE_SECRET,
    callbackUrl: "http://localhost:5000/api/auth/google/callback",
    frontendUrl: process.env.FRONTEND_URL,
  });
});

// Debug route to check what URL Google will receive
router.get("/debug-google-url", (req, res) => {
  const googleAuthUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(
      "http://localhost:5000/api/auth/google/callback"
    )}&` +
    `response_type=code&` +
    `scope=${encodeURIComponent("profile email")}`;

  res.json({
    message: "This is the URL that will be sent to Google",
    url: googleAuthUrl,
    decodedRedirectUri: "http://localhost:5000/api/auth/google/callback",
  });
});

// Google OAuth initiate route
router.get(
  "/google",
  (req, res, next) => {
    console.log("🚀 Initiating Google OAuth...");
    console.log("Request URL:", req.originalUrl);
    console.log(
      "Full URL:",
      `${req.protocol}://${req.get("host")}${req.originalUrl}`
    );
    next();
  },
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google OAuth callback route
router.get(
  "/google/callback",
  (req, res, next) => {
    console.log("📥 Google OAuth callback received");
    console.log(
      "Callback URL:",
      `${req.protocol}://${req.get("host")}${req.originalUrl}`
    );
    console.log("Query params:", req.query);
    next();
  },
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed`,
  }),
  async (req, res) => {
    try {
      console.log("✅ OAuth successful, generating token...");

      const token = jwt.sign(
        { id: req.user._id, role: req.user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      if (!req.user.authTokens) {
        req.user.authTokens = [];
      }
      req.user.authTokens.push({ token });
      await req.user.save();

      const redirectUrl = `${process.env.FRONTEND_URL}/oauth-success?token=${token}&userId=${req.user._id}&role=${req.user.role}`;
      console.log("🔄 Redirecting to:", redirectUrl);

      return res.redirect(redirectUrl);
    } catch (error) {
      console.error("❌ Google auth callback error:", error);
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=auth_failed`
      );
    }
  }
);

module.exports = router;
