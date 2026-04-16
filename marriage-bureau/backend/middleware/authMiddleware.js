const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const user = await User.findById(decoded.userId).select('isAdmin isApproved email name');
            if (!user) {
                return res.status(401).json({ message: "Not authorized, user not found" });
            }

            if (!user.isAdmin && !user.isApproved) {
                return res.status(403).json({ message: 'Account pending admin approval' });
            }

            req.user = {
                ...decoded,
                isAdmin: user.isAdmin,
                isApproved: user.isApproved,
                name: user.name,
                email: user.email,
            };

            next();
        } catch (error) {
            return res.status(401).json({ message: "Not authorized, token failed" });
        }
    }

    if (!token) {
        return res.status(401).json({ message: "Not authorized, no token" });
    }
};

const authorizeAdmin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
        return;
    }

    return res.status(403).json({ message: 'Not authorized as admin' });
};

module.exports = { protect, authorizeAdmin };