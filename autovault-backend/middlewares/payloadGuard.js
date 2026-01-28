const { logAudit } = require('../config/logger');
const { extractToken, verifyToken } = require('../utils/jwtHandler');
const User = require('../models/User');

// In-memory store for violation tracking (per-session/per-user-id)
const violations = new Map();

// Configuration
const WARNING_LIMIT = 3;
const BLOCK_DURATION_MS = 20 * 60 * 1000; // 20 minutes

/**
 * Patterns that indicate malicious activity (XSS, Injection attempts)
 */
const MALICIOUS_PATTERNS = [
    /<script.*?>/gi,
    /javascript:/gi,
    /onerror\s*=/gi,
    /onload\s*=/gi,
    /onclick\s*=/gi,
    /onmouseover\s*=/gi,
    /eval\(.*?\)/gi,
    /base64\s*,/gi,
    /alert\(.*?\)/gi,
    /prompt\(.*?\)/gi,
    /confirm\(.*?\)/gi,
    /document\.cookie/gi,
    /document\.location/gi,
    /window\.location/gi,
    /iframe.*src/gi,
    /svg.*?onload/gi
];

/**
 * Recursively check if any string in an object matches malicious patterns
 */
const hasMaliciousContent = (val) => {
    if (typeof val === 'string') {
        return MALICIOUS_PATTERNS.some(pattern => pattern.test(val));
    }
    if (Array.isArray(val)) {
        return val.some(item => hasMaliciousContent(item));
    }
    if (val !== null && typeof val === 'object') {
        return Object.values(val).some(item => hasMaliciousContent(item));
    }
    return false;
};

/**
 * Payload Guard Middleware
 * Detects malicious payloads, warns users, and blocks Account after threshold.
 */
const payloadGuard = async (req, res, next) => {
    const now = Date.now();
    let userId = null;
    let user = null;

    // 1. Identify User (if logged in)
    try {
        const token = extractToken(req);
        if (token) {
            const decoded = verifyToken(token);
            if (decoded) {
                userId = decoded._id || decoded.id;
                user = await User.findById(userId);
            }
        }
    } catch (err) {
        // Suppress auth errors here, we just want to know if they ARE logged in
    }

    // 2. Check if Account is currently locked (via User model)
    // We skip this check for the login route to allow users to switch accounts 
    // if their current session's account is locked.
    const isLoginRoute = req.path.includes('/login');

    if (user && user.isAccountLocked() && !isLoginRoute) {
        const lockTime = Math.ceil((user.accountLockedUntil - now) / 60000);
        return res.status(403).json({
            success: false,
            message: `🚫 ACCOUNT LOCKED: Your account has been temporarily locked for ${lockTime} more minutes due to repeated malicious payload attempts.`,
            securityStatus: 'BLOCKED'
        });
    }

    // 3. Check for malicious patterns in body, query, and params
    const isMalicious = hasMaliciousContent(req.body) ||
        hasMaliciousContent(req.query) ||
        hasMaliciousContent(req.params);

    if (isMalicious) {
        // Log the violation
        logAudit('MALICIOUS_PAYLOAD_DETECTED', userId || 'GUEST', {
            ip: req.ip,
            url: req.originalUrl,
            method: req.method,
            payload: {
                body: req.body,
                query: req.query,
                params: req.params
            }
        });

        // If Guest - Track count just for the warning message (no block by IP)
        if (!userId) {
            const guestIp = req.ip;
            let guestViolator = violations.get(guestIp);
            if (!guestViolator) {
                guestViolator = { count: 1, lastAttempt: now };
                violations.set(guestIp, guestViolator);
            } else {
                guestViolator.count += 1;
                guestViolator.lastAttempt = now;
            }

            return res.status(400).json({
                success: false,
                message: `⚠️ SECURITY WARNING: Malicious pattern detected (${guestViolator.count}/${WARNING_LIMIT}). Guest attempts are strictly monitored.`,
                securityStatus: 'WARNING'
            });
        }

        // If Authenticated User - Track and Block
        let violator = violations.get(userId);
        if (!violator) {
            violator = { count: 1, lastAttempt: now };
            violations.set(userId, violator);
        } else {
            violator.count += 1;
            violator.lastAttempt = now;
        }

        // 4. Enforce blocking for account
        if (violator.count >= WARNING_LIMIT) {
            // Lock account in Database
            await User.findByIdAndUpdate(userId, {
                accountLockedUntil: now + BLOCK_DURATION_MS,
                $inc: { failedLoginAttempts: 1 } // Treat as high-risk behavior
            });

            // Clear in-memory violation after DB lock
            violations.delete(userId);

            return res.status(403).json({
                success: false,
                message: "🚫 ACCOUNT BLOCKED: Your account has been locked for 20 minutes due to persistent malicious activity.",
                securityStatus: 'BLOCKED'
            });
        }

        // 5. Issue warning
        return res.status(400).json({
            success: false,
            message: `⚠️ SECURITY WARNING: Malicious pattern detected (${violator.count}/${WARNING_LIMIT}). Continued attempts will lead to an immediate account lock.`,
            securityStatus: 'WARNING'
        });
    }

    next();
};

module.exports = { payloadGuard };
