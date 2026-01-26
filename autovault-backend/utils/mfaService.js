const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const crypto = require('crypto');
const MFASecret = require('../models/MFASecret');

/**
 * MFA Service
 * Handles Two-Factor Authentication with TOTP (Google Authenticator) and backup codes
 */

/**
 * Generate TOTP secret and QR code for Google Authenticator
 */
const generateTOTPSecret = async (user) => {
    const secret = speakeasy.generateSecret({
        name: `AutoVault (${user.email})`,
        issuer: 'AutoVault',
        length: 32
    });

    // Generate QR code data URL
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    return {
        secret: secret.base32,
        qrCode: qrCodeUrl,
        otpauthUrl: secret.otpauth_url
    };
};

/**
 * Verify TOTP code from Google Authenticator
 */
const verifyTOTPCode = (secret, token) => {
    return speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: token,
        window: 2 // Allow 2 steps before/after for clock skew
    });
};

/**
 * Generate backup codes for MFA recovery
 */
const generateBackupCodes = (count = 8) => {
    const codes = [];
    for (let i = 0; i < count; i++) {
        // Generate 8-character alphanumeric code
        const code = crypto.randomBytes(4).toString('hex').toUpperCase();
        codes.push(code);
    }
    return codes;
};

/**
 * Setup MFA for a user
 */
const setupMFA = async (user) => {
    // Generate TOTP secret
    const { secret, qrCode, otpauthUrl } = await generateTOTPSecret(user);

    // Generate backup codes
    const backupCodes = generateBackupCodes();

    // Encrypt secret
    const encryptedSecret = MFASecret.encrypt(secret);

    // Encrypt backup codes
    const encryptedBackupCodes = backupCodes.map(code => ({
        code: MFASecret.encrypt(code),
        used: false
    }));

    // Delete existing MFA setup if any
    await MFASecret.findOneAndDelete({ userId: user._id });

    // Store encrypted MFA data
    await MFASecret.create({
        userId: user._id,
        totpSecret: encryptedSecret,
        backupCodes: encryptedBackupCodes
    });

    return {
        secret,
        qrCode,
        otpauthUrl,
        backupCodes // Return plain codes for user to save
    };
};

/**
 * Verify MFA code (TOTP or backup code)
 */
const verifyMFACode = async (userId, code) => {
    const mfaData = await MFASecret.findOne({ userId });

    if (!mfaData) {
        return {
            valid: false,
            message: 'MFA not set up for this user'
        };
    }

    // Try TOTP verification first
    const decryptedSecret = MFASecret.decrypt(mfaData.totpSecret);
    const isTOTPValid = verifyTOTPCode(decryptedSecret, code);

    if (isTOTPValid) {
        // Update last used timestamp
        mfaData.lastUsed = new Date();
        await mfaData.save();

        return {
            valid: true,
            type: 'totp',
            message: 'TOTP code verified'
        };
    }

    // Try backup code verification
    const codeUpper = code.toUpperCase().replace(/[^A-Z0-9]/g, '');

    for (let i = 0; i < mfaData.backupCodes.length; i++) {
        const backupCode = mfaData.backupCodes[i];

        if (backupCode.used) continue;

        const decryptedBackupCode = MFASecret.decrypt(backupCode.code);

        if (decryptedBackupCode === codeUpper) {
            // Mark backup code as used
            mfaData.backupCodes[i].used = true;
            mfaData.backupCodes[i].usedAt = new Date();
            mfaData.lastUsed = new Date();
            await mfaData.save();

            // Count remaining backup codes
            const remainingCodes = mfaData.backupCodes.filter(bc => !bc.used).length;

            return {
                valid: true,
                type: 'backup',
                message: 'Backup code verified',
                remainingBackupCodes: remainingCodes
            };
        }
    }

    return {
        valid: false,
        message: 'Invalid verification code'
    };
};

/**
 * Regenerate backup codes
 */
const regenerateBackupCodes = async (userId) => {
    const mfaData = await MFASecret.findOne({ userId });

    if (!mfaData) {
        throw new Error('MFA not set up for this user');
    }

    // Generate new backup codes
    const backupCodes = generateBackupCodes();

    // Encrypt new backup codes
    const encryptedBackupCodes = backupCodes.map(code => ({
        code: MFASecret.encrypt(code),
        used: false
    }));

    // Update database
    mfaData.backupCodes = encryptedBackupCodes;
    await mfaData.save();

    return backupCodes;
};

/**
 * Disable MFA for a user
 */
const disableMFA = async (userId) => {
    await MFASecret.findOneAndDelete({ userId });
};

/**
 * Check remaining backup codes
 */
const getRemainingBackupCodes = async (userId) => {
    const mfaData = await MFASecret.findOne({ userId });

    if (!mfaData) {
        return 0;
    }

    return mfaData.backupCodes.filter(bc => !bc.used).length;
};

module.exports = {
    generateTOTPSecret,
    verifyTOTPCode,
    generateBackupCodes,
    setupMFA,
    verifyMFACode,
    regenerateBackupCodes,
    disableMFA,
    getRemainingBackupCodes
};
