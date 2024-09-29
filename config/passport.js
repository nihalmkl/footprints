const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const env = require('dotenv').config()
const User = require('../models/userSchema');


passport.use(new GoogleStrategy({
        clientID:process.env.GOOGLE_CLEINT_ID ,
        clientSecret: process.env.GOOGLE_CLEINT_SECRET,
        callbackURL:'/auth/google/callback'
    },
    async (accessToken, refreshToken, profile, done) => {
        // finding existing user
        try {
          let user = await User.findOne({ googleId: profile.id });
          if (!user) {
            user = await User.create({
              googleId: profile.id,
              username: profile.displayName,
              email: profile.emails[0].value,
              // profilePic: profile.photos[0].value
            });
          }
          await user.save()
          return done(null, user);
        } catch (err) {
          return done(err, false);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, false);
    }
  });
  module.exports = passport;