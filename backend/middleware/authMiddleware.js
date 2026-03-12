const jwt = require('jsonwebtoken')

const authMiddleware = (req, res, next) => {

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


// for users to submit without being logged in
// if logged in or not logged in they move through next() anyways
const optionalAuth = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]
        if (token) {
            const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
            req.user = decodedToken
        }
        next()
    } catch (err) {
        next()
    }
}

module.exports = { authMiddleware, optionalAuth }