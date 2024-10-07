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
        try {
          let user = await User.findOne({email: profile.emails[0].value});
          if (!user) {
            user = await User.create({
              username: profile.displayName,
              email: profile.emails[0].value,
            });
            await user.save()
          }

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