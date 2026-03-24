const passport = require('passport')
const { Strategy: GoogleStrategy } = require('passport-google-oauth20')
const { User, Streak } = require('../models/index')
const { Op } = require('sequelize')

// - Full Flow for OAuth 2.0 ( first time implementing this )
// our AuthModal calls localhost/Port/auth/google
// backend redirects to Google for the user to give consent
// Google then regenerates temp code
// Passport exchanges the code for user info
// We then check the DB for existing email or google_id and return or create new User
// We generate a JWT token and redirect back to frontend to call login function

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'https://api.daily-sports-trivia.com/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // check if user already exists by google email
        let user = await User.findOne({ 
           where: { 
            [Op.or]: [
            { email: profile.emails[0].value },
            { google_id: profile.id }
         ]
      } 

        })

        if (user) {
            // user exists then return them
            return done(null, user)
        }

        // If they are a new user then register
        user = await User.create({
            username: profile.displayName.replace(/\s/g, '_').toLowerCase(),
            email: profile.emails[0].value,
            password: 'google_oauth_no_password',
            google_id: profile.id
        })

        // create streak record for the new user 
        await Streak.create({
            user_id: user.user_id,
            current_streak: 0,
            longest_streak: 0
        })

        return done(null, user)
    } catch (err) {
        return done(err, null)
    }
}))

module.exports = passport
