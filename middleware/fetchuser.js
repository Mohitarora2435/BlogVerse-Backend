const jwt = require('jsonwebtoken');
require('dotenv').config();
const JWTSecret = process.env.secret;

const fetchuser = (req, res, next) => {
    const authtoken = req.header('Authorization');

    if (!authtoken) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(authtoken.split(' ')[1], JWTSecret);
        req.user = decoded.user;
        next();
    } catch (error) {
        console.error('Error verifying token:', error);
        res.status(401).json({ error: 'Invalid token.' });
    }
}

module.exports = fetchuser;
