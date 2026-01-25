const { logAudit } = require('../config/logger');

/**
 * Audit logging middleware
 * Logs authenticated user actions for security auditing
 */
const auditLogger = (action) => {
    return (req, res, next) => {
        // Only log if user is authenticated
        if (req.user) {
            const details = {
                userId: req.user._id,
                username: req.user.username,
                action,
                ip: req.ip,
                method: req.method,
                url: req.originalUrl,
                userAgent: req.get('user-agent')
            };

            // Log the action asynchronously
            setImmediate(() => {
                logAudit(action, req.user._id, details);
            });
        }

        next();
    };
};

module.exports = { auditLogger };
