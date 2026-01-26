const xss = require('xss');

/**
 * Recursively sanitize an object to prevent XSS attacks
 */
const sanitizeObject = (obj) => {
    if (typeof obj === 'string') {
        return xss(obj);
    }

    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
    }

    if (obj !== null && typeof obj === 'object') {
        const sanitized = {};
        for (const key in obj) {
            // Use Object.prototype.hasOwnProperty.call instead of obj.hasOwnProperty
            // to handle objects without Object.prototype (like query params)
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                sanitized[key] = sanitizeObject(obj[key]);
            }
        }
        return sanitized;
    }

    return obj;
};

/**
 * Global XSS sanitization middleware
 * Sanitizes req.body, req.query, and req.params
 */
const sanitizeInput = (req, res, next) => {
    try {
        // Sanitize request body
        if (req.body) {
            req.body = sanitizeObject(req.body);
        }

        // Sanitize query parameters
        if (req.query) {
            req.query = sanitizeObject(req.query);
        }

        // Sanitize URL parameters
        if (req.params) {
            req.params = sanitizeObject(req.params);
        }

        next();
    } catch (error) {
        console.error('Error during input sanitization:', error);
        return res.status(500).json({
            success: false,
            message: 'Error processing request'
        });
    }
};

module.exports = { sanitizeInput };
