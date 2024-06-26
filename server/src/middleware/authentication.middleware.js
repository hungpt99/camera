const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    try {
        const token = req.cookies.access_token;
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = decoded._id;
        req.role = decoded.user_role;
    } catch (err) {
    }
    next();
}

module.exports = verifyToken