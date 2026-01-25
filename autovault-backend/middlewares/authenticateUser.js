const { extractToken, verifyToken } = require("../utils/jwtHandler");
const User = require("../models/User");

exports.authenticateUser = async (req, res, next) => {
    try {
        // Extract token from cookie or Authorization header
        const token = extractToken(req);

        // DEBUG LOGGING
        if (process.env.NODE_ENV === 'development') {
            console.log('--- Auth Debug ---');
            console.log('Cookies:', req.cookies); // Using cookie-parser
            console.log('Auth Header:', req.headers.authorization);
            console.log('Extracted Token:', token ? token.substring(0, 15) + '...' : 'None');
            console.log('------------------');
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication required. Please login."
            });
        }

        // Verify token
        const decoded = verifyToken(token);

        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired token. Please login again."
            });
        }

        // Find user
        const user = await User.findById(decoded._id || decoded.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found. Please login again."
            });
        }

        // Check if account is locked
        if (user.isAccountLocked()) {
            const lockTime = Math.ceil((user.accountLockedUntil - Date.now()) / 60000);
            return res.status(403).json({
                success: false,
                message: `Account is locked. Try again in ${lockTime} minutes.`
            });
        }

        // Check account status
        if (user.accountStatus !== 'active') {
            return res.status(403).json({
                success: false,
                message: `Account is ${user.accountStatus}. Please contact support.`
            });
        }

        // Attach user to request for further use
        req.user = user;
        next(); // Continue to next function
    } catch (err) {
        console.error('Authentication error:', err);
        return res.status(500).json({
            success: false,
            message: "Authentication failed"
        });
    }
};

exports.isAdmin = async (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: "Admin privilege required"
        });
    }
};

exports.isUser = async (req, res, next) => {
    if (req.user && req.user.role === 'normal') {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: "User privilege required"
        });
    }
};
