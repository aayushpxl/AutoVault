const mongoose = require('mongoose');
const crypto = require('crypto');

/**
 * MFASecret Model
 * Stores encrypted TOTP secrets and backup codes for two-factor authentication
 */
const MFASecretSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true
    },
    // Encrypted TOTP secret for Google Authenticator
    totpSecret: {
        type: String,
        required: true
    },
    // Array of encrypted backup codes
    backupCodes: [{
        code: String,
        used: {
            type: Boolean,
            default: false
        },
        usedAt: Date
    }],
    // Tracking
    lastUsed: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Encryption key from environment
const ENCRYPTION_KEY = process.env.MFA_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex').slice(0, 32);
const IV_LENGTH = 16;

/**
 * Encrypt sensitive data
 */
MFASecretSchema.statics.encrypt = function (text) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
};

/**
 * Decrypt sensitive data
 */
MFASecretSchema.statics.decrypt = function (text) {
    const parts = text.split(':');
    const iv = Buffer.from(parts.shift(), 'hex');
    const encryptedText = Buffer.from(parts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
};

module.exports = mongoose.model('MFASecret', MFASecretSchema);
