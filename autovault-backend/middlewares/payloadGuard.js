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
    } catch (err) { }

    // 2. Check if Account is currently locked
    // We only skip the check for the /logout route and specific /login login POST
    // We MUST block registration if they are trying to bypass via a locked session
    const isPublicAuthRoute = req.path.match(/\/(login|register|logout|forgot-password|reset-password)/);
    const isLogout = req.path.includes('/logout');

    if (user && user.isAccountLocked() && !isLogout) {
        const lockTime = Math.ceil((user.accountLockedUntil - now) / 60000);

        // Log the attempted bypass
        logAudit('LOCKED_ACCOUNT_ACCESS_ATTEMPT', user._id, {
            url: req.originalUrl,
            ip: req.ip
        });

        // Clear the token cookie to stop the cycle if they are persistent
        clearTokenCookie(res);

        return res.status(403).json({
            success: false,
            message: `🚫 ACCOUNT LOCKED: Your account is locked for ${lockTime} more minutes. Session cleared.`,
            securityStatus: 'BLOCKED'
        });
    }

    // 3. Guest Violation Check (Session-based, not IP-based)
    // This satisfies "do not block the ip"
    const guestSecurityCookie = req.cookies.autovault_sec_track;
    let guestCount = 0;
    if (guestSecurityCookie) {
        try {
            const data = JSON.parse(Buffer.from(guestSecurityCookie, 'base64').toString());
            if (data.expiry > now) {
                guestCount = data.count;
                // If they are strictly blocked (even as guest session)
                if (data.blockedUntil > now) {
                    return res.status(403).json({
                        success: false,
                        message: "🚫 ACCESS DENIED: This session has been blocked due to repeated malicious attempts.",
                        securityStatus: 'BLOCKED'
                    });
                }
            }
        } catch (e) { guestCount = 0; }
    }

    // 4. Check for malicious patterns in body, query, and params
    const isMalicious = hasMaliciousContent(req.body) ||
        hasMaliciousContent(req.query) ||
        hasMaliciousContent(req.params);

    if (isMalicious) {
        // Increment Violation
        const newCount = (userId ? (violations.get(userId)?.count || 0) : guestCount) + 1;
        const limit = userId ? 2 : WARNING_LIMIT; // Be stricter with logged-in users (2 attempts)

        logAudit('MALICIOUS_PAYLOAD_DETECTED', userId || 'GUEST', {
            ip: req.ip,
            url: req.originalUrl,
            method: req.method,
            violationCount: newCount,
            payload: { body: req.body, query: req.query, params: req.params }
        });

        if (userId) {
            // AUTHENTICATED USER BLOCK
            if (newCount >= limit) {
                await User.findByIdAndUpdate(userId, {
                    accountLockedUntil: now + BLOCK_DURATION_MS,
                    $inc: { failedLoginAttempts: 1 }
                });

                violations.delete(userId);
                clearTokenCookie(res);

                return res.status(403).json({
                    success: false,
                    message: "🚫 ACCOUNT BLOCKED: Your account has been locked due to malicious activity. Session cleared.",
                    securityStatus: 'BLOCKED'
                });
            }

            violations.set(userId, { count: newCount, lastAttempt: now });
            return res.status(400).json({
                success: false,
                message: `⚠️ SECURITY WARNING: Malicious pattern detected (${newCount}/${limit}). Account will be locked on next attempt.`,
                securityStatus: 'WARNING'
            });

        } else {
            // GUEST SESSION BLOCK (via Security Cookie)
            const blockedUntil = newCount >= WARNING_LIMIT ? now + BLOCK_DURATION_MS : 0;
            const secData = Buffer.from(JSON.stringify({
                count: newCount,
                expiry: now + (24 * 60 * 60 * 1000), // Tracks for 24h
                blockedUntil
            })).toString('base64');

            res.cookie('autovault_sec_track', secData, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 24 * 60 * 60 * 1000
            });

            if (blockedUntil > 0) {
                return res.status(403).json({
                    success: false,
                    message: "🚫 SESSION BLOCKED: You are blocked from performing further actions due to malicious activity.",
                    securityStatus: 'BLOCKED'
                });
            }

            return res.status(400).json({
                success: false,
                message: `⚠️ SECURITY WARNING: Malicious pattern detected (${newCount}/${WARNING_LIMIT}). Guest session strictly monitored.`,
                securityStatus: 'WARNING'
            });
        }
    }

    next();
};

module.exports = { payloadGuard };
