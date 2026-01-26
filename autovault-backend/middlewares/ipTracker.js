const { logAudit } = require('../config/logger');
const User = require('../models/User');

/**
 * IP Tracker Middleware
 * Tracks login locations and notifies user of new devices
 */
const ipTracker = async (req, res, next) => {
    // Only track for successful logins (this middleware should be called after successful login)
    // However, since it's a middleware, it runs before the controller.
    // So we'll attach a helper to the request object that the controller can call.

    req.trackLogin = async (user) => {
        try {
            const currentIP = req.ip;
            const userAgent = req.headers['user-agent'] || 'Unknown Device';

            // Check if this is a new IP for this user
            // In a production system, we would store a list of known IPs/Devices in a separate collection
            // For now, we'll check against lastLoginIP

            // If we had a mechanism to store history:
            // const knownDevice = await DeviceHistory.findOne({ userId: user._id, ip: currentIP });

            if (user.lastLoginIP && user.lastLoginIP !== currentIP) {
                console.log(`⚠️ New login IP for user ${user.username}: ${currentIP} (Previous: ${user.lastLoginIP})`);

                // Send notification for new device
                const { sendNewDeviceNotification } = require('../utils/emailService');

                // Don't await this, let it run in background
                sendNewDeviceNotification(user, {
                    ip: currentIP,
                    userAgent: userAgent,
                    timestamp: new Date()
                }).catch(err => console.error('Failed to send new device notification:', err));
            }

        } catch (error) {
            console.error('IP Tracking error:', error);
        }
    };

    next();
};

module.exports = { ipTracker };
