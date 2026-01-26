const mongoose = require('mongoose');

/**
 * AuditLog Model
 * Stores comprehensive logs of user activities for security and compliance.
 * Includes TTL index for automatic retention policy handling.
 */
const AuditLogSchema = new mongoose.Schema({
    // Action performed (e.g., LOGIN_SUCCESS, USER_UPDATED, DELETE_VEHICLE)
    action: {
        type: String,
        required: true,
        index: true
    },

    // User who performed the action
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false, // Some actions might be anonymous (e.g., failed login with invalid user)
        index: true
    },

    // Cached username for display (in case user is deleted)
    username: {
        type: String,
        required: false
    },

    // Detailed metadata about the action (resource IDs, changes, etc.)
    details: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },

    // Request Context
    ip: String,
    userAgent: String,
    method: String,
    endpoint: String,

    // Outcome status (success/failure)
    status: {
        type: String,
        enum: ['success', 'failure', 'warning'],
        default: 'success'
    },

    // Timestamp (indexed for range queries)
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    }
}, {
    timestamps: true // adds createdAt, updatedAt
});

// TTL Index: Automatically delete logs older than 90 days
// 90 days * 24 hours * 60 minutes * 60 seconds = 7776000 seconds
AuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

// Compound index for common filter: User actions within a date range
AuditLogSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('AuditLog', AuditLogSchema);
