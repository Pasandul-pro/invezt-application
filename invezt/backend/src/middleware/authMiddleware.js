const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // 1. Get the token from the request header
    const token = req.header('x-auth-token');

    // 2. Check if no token exists
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // 3. Verify the token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 4. Add the user ID from the token to the request object
        req.user = decoded.user; 
        next(); // Move to the next function (The Controller)
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};