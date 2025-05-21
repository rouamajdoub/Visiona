// googleOAuthRoutes.js
const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Remove the starting slash as we'll be mounted at /api/auth already
router.get(
  "google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login",
  }),
  async (req, res) => {
    try {
      // Generate JWT token
      const token = jwt.sign(
        { id: req.user._id, role: req.user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      // Store token in user document
      req.user.authTokens.push({ token });
      await req.user.save();

      // Redirect to frontend with token
      const redirectUrl = `${process.env.FRONTEND_URL}/oauth-success?token=${token}&userId=${req.user._id}&role=${req.user.role}`;
      return res.redirect(redirectUrl);
    } catch (error) {
      console.error("Google auth callback error:", error);
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=auth_failed`
      );
    }
  }
);

module.exports = router;
