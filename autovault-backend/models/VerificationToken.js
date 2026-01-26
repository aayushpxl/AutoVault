const mongoose = require('mongoose');

/**
 * VerificationToken Model
 * Stores email verification and password reset tokens
 * with automatic expiration using TTL index
 */
const VerificationTokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    token: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    type: {
        type: String,
        enum: ['email_verification', 'password_reset'],
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    }
}, {
    timestamps: true
});

// TTL index to automatically delete expired tokens
VerificationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index for efficient queries
VerificationTokenSchema.index({ userId: 1, type: 1 });

module.exports = mongoose.model('VerificationToken', VerificationTokenSchema);
