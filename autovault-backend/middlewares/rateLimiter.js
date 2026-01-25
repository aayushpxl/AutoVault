const rateLimit = require('express-rate-limit');

// Registration rate limiter - 3 attempts per hour per IP
const registrationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    message: {
        success: false,
        message: 'Too many registration attempts from this IP. Please try again after an hour.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Skip successful requests from counting
    skipSuccessfulRequests: true
});

// Login rate limiter - 10 attempts per 10 minutes per IP
const loginLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 10,
    message: {
        success: false,
        message: 'Too many login attempts from this IP. Please try again after 10 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Skip successful requests from counting
    skipSuccessfulRequests: true
});

// General API rate limiter - 100 requests per 15 minutes per IP
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: {
        success: false,
        message: 'Too many requests from this IP. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Strict limiter for sensitive operations - 5 per hour
const strictLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    message: {
        success: false,
        message: 'Too many requests. Please try again after an hour.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = {
    registrationLimiter,
    loginLimiter,
    generalLimiter,
    strictLimiter
};
