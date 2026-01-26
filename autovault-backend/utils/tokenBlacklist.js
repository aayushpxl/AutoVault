/**
 * Token Blacklist Service
 * Basic in-memory blacklist for revoked JWT tokens (logout)
 * For production, use Redis instead of memory
 */

// In-memory store: { token: deletionTimestamp }
const blacklist = new Map();

// Clean up expired tokens every 1 hour
setInterval(() => {
    const now = Date.now();
    for (const [token, expiresAt] of blacklist.entries()) {
        if (now > expiresAt) {
            blacklist.delete(token);
        }
    }
}, 60 * 60 * 1000);

/**
 * Add token to blacklist
 * @param {string} token - JWT token to blacklist
 * @param {number} expiresInSeconds - Token expiration in seconds (default 7 days)
 */
const addToBlacklist = (token, expiresInSeconds = 7 * 24 * 60 * 60) => {
    if (!token) return;

    // Store with cleanup timestamp
    const expiresAt = Date.now() + (expiresInSeconds * 1000);
    blacklist.set(token, expiresAt);

    // Debug log
    if (process.env.NODE_ENV === 'development') {
        console.log(`🚫 Token added to blacklist (Size: ${blacklist.size})`);
    }
};

/**
 * Check if token is blacklisted
 * @param {string} token - JWT token to check
 * @returns {boolean} - True if blacklisted
 */
const isBlacklisted = (token) => {
    if (!token) return false;
    return blacklist.has(token);
};

module.exports = {
    addToBlacklist,
    isBlacklisted
};
