const jwt = require('jsonwebtoken')

const googleCallback = (req, res) => {
    const token = jwt.sign(
        { user_id: req.user.user_id, email: req.user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    )

    const user = {
        user_id: req.user.user_id,
        username: req.user.username,
        email: req.user.email,
        created_at: req.user.created_at
    }

    const params = new URLSearchParams({
        token,
        user: JSON.stringify(user)
    })

    res.redirect(`${process.env.FRONTEND_URL}?${params.toString()}`)
}

module.exports = { googleCallback }