const jwt = require('jsonwebtoken');

/**
 * Generate JWT token with user payload
 */
const generateToken = (user) => {
    const payload = {
        _id: user._id,
        email: user.email,
        username: user.username,
        role: user.role
    };

    const expiresIn = process.env.JWT_COOKIE_EXPIRES_IN
        ? `${process.env.JWT_COOKIE_EXPIRES_IN}d`
        : '7d';

    return jwt.sign(payload, process.env.SECRET, { expiresIn });
};

/**
 * Set JWT token in HttpOnly cookie
 */
const setTokenCookie = (res, token) => {
    const expiryDays = parseInt(process.env.JWT_COOKIE_EXPIRES_IN) || 7;
    const cookieOptions = {
        httpOnly: true, // Prevents XSS attacks
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: 'strict', // CSRF protection
        maxAge: expiryDays * 24 * 60 * 60 * 1000, // Convert days to milliseconds
        path: '/' // Cookie available for all routes
    };

    res.cookie('token', token, cookieOptions);
};

/**
 * Clear authentication cookie
 */
const clearTokenCookie = (res) => {
    res.cookie('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        expires: new Date(0), // Expire immediately
        path: '/'
    });
};

/**
 * Extract token from cookie or Authorization header
 */
const extractToken = (req) => {
    // First try to get from cookie
    if (req.cookies && req.cookies.token) {
        return req.cookies.token;
    }

    // Fallback to Authorization header for backwards compatibility
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.split(' ')[1];
    }

    return null;
};

/**
 * Verify JWT token
 */
const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.SECRET);
    } catch (error) {
        return null;
    }
};

module.exports = {
    generateToken,
    setTokenCookie,
    clearTokenCookie,
    extractToken,
    verifyToken
};
