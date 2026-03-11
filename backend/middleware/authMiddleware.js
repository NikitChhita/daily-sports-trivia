const jwt = require('jsonwebtoken')

module.expots = (req, res, next) => {

    // precheck to see if the request will go through
    // mostly for CORS errors
    if(req.method === 'OPTIONS') {
        return next()
    }

    try {
        // we only want the token part of the header, not bearer
        const token = req.headers.authorization?.split(' ')[1]

        // no token at all
        if(!token) {
            return res.status(401).json({ message: 'Authentication required'})
        }

        // next we need to verify the token
        // making sure its not expired or invalid
        // if its valid it will store user info 
        const decodedToken  = jwt.verify(token, process.env.JWT_SECRET)

        // we store user info from the JWT token so we can use it in other routes
        // we wont recieve user info from req.body from routes that are not actively sending data like login and register
        req.user = decodedToken
        // we move to the actual route handler
        next()
        // middleware function is complete


    } catch(err) {
        // there is a jwt error somewhere
        return res.status(401).json({ message: 'Authentication failed '})
    }
}

module.exports = authMiddleware