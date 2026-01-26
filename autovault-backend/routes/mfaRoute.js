const express = require('express');
const router = express.Router();

// Import MFA controller
const {
    setupTOTPMFA,
    verifyTOTPSetup,
    verifyMFALogin,
    disableMFAForUser,
    regenerateBackupCodes,
    getMFAStatus
} = require('../controllers/mfaController');

// Import middlewares
const { authenticateUser } = require('../middlewares/authenticateUser');
const { strictLimiter } = require('../middlewares/rateLimiter');

// --- Public Routes ---
// Verify MFA code during login (no auth required)
router.post('/verify-login', strictLimiter, verifyMFALogin);

// --- Authenticated Routes ---
// Get MFA status
router.get('/status', authenticateUser, getMFAStatus);

// Setup TOTP MFA (returns QR code)
router.post('/setup', authenticateUser, setupTOTPMFA);

// Verify and enable TOTP MFA
router.post('/verify-setup', authenticateUser, verifyTOTPSetup);

// Disable MFA (requires password)
router.post('/disable', authenticateUser, disableMFAForUser);

// Regenerate backup codes (requires password)
router.post('/backup-codes', authenticateUser, regenerateBackupCodes);

module.exports = router;
