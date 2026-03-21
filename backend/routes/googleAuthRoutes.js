const express = require('express')
const router = express.Router()
const passport = require('../config/passport')
const { googleCallback } = require('../controllers/googleAuthController')

router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
}))

router.get('/google/callback',
    passport.authenticate('google', {
        session: false,
        failureRedirect: 'http://localhost:5173?auth=failed'
    }),
    googleCallback
)

module.exports = router