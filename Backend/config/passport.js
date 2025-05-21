const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

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
      // Make sure this matches the route in googleOAuthRoutes.js
      callbackURL: "http://localhost:5000/api/auth/google/callback",
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists in our DB
        let user = await User.findOne({
          $or: [{ googleId: profile.id }, { email: profile.emails[0].value }],
        });

        if (user) {
          // If user exists but doesn't have googleId, update it
          if (!user.googleId) {
            user.googleId = profile.id;
            user.authMethod = "google";
            await user.save();
          }
        } else {
          // Create a new user
          user = await User.create({
            googleId: profile.id,
            email: profile.emails[0].value,
            prenom: profile.name.givenName || "",
            nomDeFamille: profile.name.familyName || "",
            pseudo:
              profile.displayName || profile.emails[0].value.split("@")[0],
            profilePicture: profile.photos[0].value || "",
            role: "client", // Default role
            isVerified: true,
            authMethod: "google",
            location: {
              country: "Tunisia", // Default
              coordinates: {
                type: "Point",
                coordinates: [10.1815, 36.8065], // Default to Tunis coordinates
              },
            },
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

module.exports = passport;
