const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const User = require('../models/user')

// Trimmed: a stray space pasted into the host's settings makes Google answer
// "OAuth client was not found".
const clientID = (process.env.GOOGLE_CLIENT_ID || '').trim()
const clientSecret = (process.env.GOOGLE_SECRET || '').trim()

if (clientID && clientSecret) {
  passport.use(new GoogleStrategy({
    clientID,
    clientSecret,
    callbackURL: (process.env.GOOGLE_CALLBACK || '').trim() || '/oauth2callback'
  }, async (accessToken, refreshToken, profile, cb) => {
    try {
      const avatar = profile.photos?.[0]?.value
      const user = await User.findOneAndUpdate(
        { googleId: profile.id },
        {
          $set: { name: profile.displayName, avatar },
          $setOnInsert: { email: profile.emails?.[0]?.value }
        },
        { new: true, upsert: true }
      )
      cb(null, user)
    } catch (err) {
      cb(err)
    }
  }))
} else {
  console.warn('GOOGLE_CLIENT_ID / GOOGLE_SECRET not set: Google sign-in is disabled.')
}

// Store just the user id in the session, and load the full user on each request.
passport.serializeUser((user, done) => done(null, user.id))

passport.deserializeUser(async (id, done) => {
  try {
    done(null, await User.findById(id))
  } catch (err) {
    done(err)
  }
})
