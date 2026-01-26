const User = require('../models/User');
const bcrypt = require('bcrypt');
const { logAudit } = require('../config/logger');
const { generateOTPWithExpiry, verifyOTP } = require('../utils/otpGenerator');
const { sendMFAEmail } = require('../utils/emailService');
const {
    setupMFA,
    verifyMFACode,
    regenerateBackupCodes: regenerateServiceBackupCodes,
    disableMFA,
    getRemainingBackupCodes
} = require('../utils/mfaService');
const { generateToken, setTokenCookie } = require('../utils/jwtHandler');

/**
 * MFA Controller
 * Handles Multi-Factor Authentication setup, verification, and management
 */

/**
 * Setup TOTP-based MFA (Google Authenticator)
 * POST /api/mfa/setup
 */
const setupTOTPMFA = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Generate TOTP secret and QR code
        const { secret, qrCode, backupCodes } = await setupMFA(user);

        // Don't enable MFA yet - wait for verification
        // This prevents users from locking themselves out

        logAudit('MFA_SETUP_INITIATED', user._id, {
            username: user.username,
            mfaMethod: 'totp',
            ip: req.ip
        });

        return res.status(200).json({
            success: true,
            message: 'MFA setup initiated. Please scan the QR code with Google Authenticator.',
            data: {
                qrCode,
                backupCodes,
                // secret is for manual entry if QR code doesn't work
                manualEntrySecret: secret
            }
        });

    } catch (error) {
        console.error('MFA setup error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to set up MFA'
        });
    }
};

/**
 * Verify and enable TOTP-based MFA
 * POST /api/mfa/verify-setup
 */
const verifyTOTPSetup = async (req, res) => {
    const { code } = req.body;

    if (!code) {
        return res.status(400).json({
            success: false,
            message: 'Verification code is required'
        });
    }

    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify the code
        const verification = await verifyMFACode(user._id, code);

        if (!verification.valid) {
            return res.status(400).json({
                success: false,
                message: 'Invalid verification code. Please try again.'
            });
        }

        // Enable MFA for the user
        user.twoFactorEnabled = true;
        user.mfaMethod = 'totp';
        await user.save();

        logAudit('MFA_ENABLED', user._id, {
            username: user.username,
            mfaMethod: 'totp',
            ip: req.ip
        });

        return res.status(200).json({
            success: true,
            message: 'Two-factor authentication enabled successfully!'
        });

    } catch (error) {
        console.error('MFA verification error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to verify MFA'
        });
    }
};

/**
 * Verify MFA code during login
 * POST /api/mfa/verify-login
 */
const verifyMFALogin = async (req, res) => {
    const { userId, code } = req.body;

    if (!userId || !code) {
        return res.status(400).json({
            success: false,
            message: 'User ID and verification code are required'
        });
    }

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check MFA method
        if (user.mfaMethod === 'totp') {
            // Verify TOTP or backup code
            const verification = await verifyMFACode(user._id, code);

            if (!verification.valid) {
                // Increment OTP attempts
                user.otpAttempts = (user.otpAttempts || 0) + 1;
                await user.save();

                // Lock account after 5 failed attempts
                if (user.otpAttempts >= 5) {
                    user.accountLockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 min
                    await user.save();

                    logAudit('MFA_LOGIN_LOCKED', user._id, {
                        username: user.username,
                        reason: 'Too many failed MFA attempts',
                        ip: req.ip
                    });

                    return res.status(403).json({
                        success: false,
                        message: 'Account temporarily locked due to too many failed MFA attempts.'
                    });
                }

                return res.status(400).json({
                    success: false,
                    message: 'Invalid verification code'
                });
            }

            // Successful MFA verification
            user.otpAttempts = 0;

            // Track login (detect new device)
            if (req.trackLogin) await req.trackLogin(user);

            user.lastLoginAt = new Date();
            user.lastLoginIP = req.ip;
            await user.save();

            // Generate JWT token
            const token = generateToken(user);
            setTokenCookie(res, token);

            const { password: _, passwordHistory, ...userData } = user.toObject();

            logAudit('MFA_LOGIN_SUCCESS', user._id, {
                username: user.username,
                mfaType: verification.type,
                ip: req.ip
            });

            return res.status(200).json({
                success: true,
                message: 'Login successful',
                data: userData,
                token,
                mfaVerified: true,
                ...(verification.type === 'backup' && {
                    warning: `Backup code used. ${verification.remainingBackupCodes} backup codes remaining.`
                })
            });

        } else if (user.mfaMethod === 'email') {
            // Verify email OTP
            const verification = verifyOTP(user.otpCode, user.otpExpiry, code);

            if (!verification.isValid) {
                user.otpAttempts = (user.otpAttempts || 0) + 1;
                await user.save();

                return res.status(400).json({
                    success: false,
                    message: verification.message
                });
            }

            // Clear OTP
            user.otpCode = undefined;
            user.otpExpiry = undefined;
            user.otpAttempts = 0;

            // Track login (detect new device)
            if (req.trackLogin) await req.trackLogin(user);

            user.lastLoginAt = new Date();
            user.lastLoginIP = req.ip;
            await user.save();

            // Generate JWT token
            const token = generateToken(user);
            setTokenCookie(res, token);

            const { password: _, passwordHistory, ...userData } = user.toObject();

            logAudit('MFA_LOGIN_SUCCESS', user._id, {
                username: user.username,
                mfaType: 'email',
                ip: req.ip
            });

            return res.status(200).json({
                success: true,
                message: 'Login successful',
                data: userData,
                token,
                mfaVerified: true
            });
        }

        return res.status(400).json({
            success: false,
            message: 'Invalid MFA method'
        });

    } catch (error) {
        console.error('MFA login verification error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to verify MFA code'
        });
    }
};

/**
 * Disable MFA
 * POST /api/mfa/disable
 */
const disableMFAForUser = async (req, res) => {
    const { password } = req.body;

    if (!password) {
        return res.status(400).json({
            success: false,
            message: 'Password is required to disable MFA'
        });
    }

    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Incorrect password'
            });
        }

        // Disable MFA
        await disableMFA(user._id);
        user.twoFactorEnabled = false;
        user.mfaMethod = 'none';
        await user.save();

        logAudit('MFA_DISABLED', user._id, {
            username: user.username,
            ip: req.ip
        });

        return res.status(200).json({
            success: true,
            message: 'Two-factor authentication has been disabled'
        });

    } catch (error) {
        console.error('MFA disable error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to disable MFA'
        });
    }
};

/**
 * Regenerate backup codes
 * POST /api/mfa/backup-codes
 */
const regenerateBackupCodes = async (req, res) => {
    const { password } = req.body;

    if (!password) {
        return res.status(400).json({
            success: false,
            message: 'Password is required to regenerate backup codes'
        });
    }

    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (!user.twoFactorEnabled || user.mfaMethod !== 'totp') {
            return res.status(400).json({
                success: false,
                message: 'TOTP-based MFA is not enabled'
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Incorrect password'
            });
        }

        // Regenerate backup codes
        const newBackupCodes = await regenerateServiceBackupCodes(user._id);

        logAudit('MFA_BACKUP_CODES_REGENERATED', user._id, {
            username: user.username,
            ip: req.ip
        });

        return res.status(200).json({
            success: true,
            message: 'New backup codes generated successfully',
            backupCodes: newBackupCodes
        });

    } catch (error) {
        console.error('Backup codes regeneration error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to regenerate backup codes'
        });
    }
};

/**
 * Get MFA status
 * GET /api/mfa/status
 */
const getMFAStatus = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const remainingBackupCodes = user.mfaMethod === 'totp'
            ? await getRemainingBackupCodes(user._id)
            : 0;

        return res.status(200).json({
            success: true,
            data: {
                enabled: user.twoFactorEnabled,
                method: user.mfaMethod,
                remainingBackupCodes
            }
        });

    } catch (error) {
        console.error('MFA status error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to get MFA status'
        });
    }
};

module.exports = {
    setupTOTPMFA,
    verifyTOTPSetup,
    verifyMFALogin,
    disableMFAForUser,
    regenerateBackupCodes,
    getMFAStatus
};
