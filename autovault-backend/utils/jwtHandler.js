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
        sameSite: 'lax', // Use 'lax' for better compatibility with localhost redirects
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
        sameSite: 'lax',
        expires: new Date(0), // Expire immediately
        path: '/'
    });
};

/**
 * Extract token from cookie or Authorization header
 */
const extractToken = (req) => {
    // Prioritize Authorization header for frontend flexibility
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        if (token && token !== 'undefined' && token !== 'null') {
            return token;
        }
    }

    // Fallback to cookie
    if (req.cookies && req.cookies.token) {
        return req.cookies.token;
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
        console.error('JWT Verification Error:', error.message);
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
