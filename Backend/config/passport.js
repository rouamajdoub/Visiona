// Backend/config/passport.js
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

// Debug environment variables
console.log("=== GOOGLE OAUTH DEBUG INFO ===");
console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
console.log(
  "AUTH_GOOGLE_SECRET:",
  process.env.AUTH_GOOGLE_SECRET ? "✓ Set" : "✗ Missing"
);
console.log(
  "Callback URL that will be sent to Google:",
  "http://localhost:5000/api/auth/google/callback"
);
console.log("===============================");

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      callbackURL: "http://localhost:5000/api/auth/google/callback",
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log(
          "Google OAuth callback received for user:",
          profile.emails[0].value
        );

        let user = await User.findOne({
          $or: [{ googleId: profile.id }, { email: profile.emails[0].value }],
        });

        if (user) {
          console.log(
            "Existing user found, updating Google ID and auth method"
          );
          if (!user.googleId) {
            user.googleId = profile.id;
            // Make sure we're setting the exact string that matches the enum
            user.authMethod = "google";

            // Debug: Log the value being set
            console.log("Setting authMethod to:", user.authMethod);
            console.log("authMethod type:", typeof user.authMethod);

            await user.save();
          }
        } else {
          console.log("Creating new user with Google auth");

          // Create user data object first for debugging
          const userData = {
            googleId: profile.id,
            email: profile.emails[0].value,
            prenom: profile.name.givenName || "",
            nomDeFamille: profile.name.familyName || "",
            pseudo:
              profile.displayName || profile.emails[0].value.split("@")[0],
            profilePicture: profile.photos[0].value || "",
            role: "client",
            isVerified: true,
            authMethod: "google", // Make sure this is exactly "google"
            authTokens: [],
            firstLogin: false,
            location: {
              country: "Tunisia",
              region: "",
              city: "",
              coordinates: {
                type: "Point",
                coordinates: [10.1815, 36.8065],
              },
            },
          };

          // Debug: Log the user data before creating
          console.log("User data to be created:", {
            ...userData,
            authMethod: userData.authMethod,
            authMethodType: typeof userData.authMethod,
          });

          user = new User(userData);
          await user.save();
          console.log("New user created successfully");
        }

        return done(null, user);
      } catch (error) {
        console.error("Google Strategy error:", error);
        console.error("Error details:", {
          message: error.message,
          name: error.name,
          stack: error.stack,
        });
        return done(error, null);
      }
    }
  )
);

module.exports = passport;
