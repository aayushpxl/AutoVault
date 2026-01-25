const crypto = require('crypto');

/**
 * Generate a random 6-digit OTP code
 */
const generateOTP = () => {
    // Generate a random 6-digit number
    return crypto.randomInt(100000, 999999).toString();
};

/**
 * Generate OTP with expiry time (default 10 minutes)
 */
const generateOTPWithExpiry = (expiryMinutes = 10) => {
    const otp = generateOTP();
    const expiry = new Date(Date.now() + expiryMinutes * 60 * 1000);

    return {
        code: otp,
        expiry
    };
};

/**
 * Verify if OTP is valid and not expired
 */
const verifyOTP = (storedOTP, storedExpiry, providedOTP) => {
    // Check if OTP exists
    if (!storedOTP || !storedExpiry) {
        return {
            isValid: false,
            message: 'No OTP found. Please request a new one.'
        };
    }

    // Check if OTP has expired
    if (new Date() > new Date(storedExpiry)) {
        return {
            isValid: false,
            message: 'OTP has expired. Please request a new one.'
        };
    }

    // Check if OTP matches
    if (storedOTP !== providedOTP) {
        return {
            isValid: false,
            message: 'Invalid OTP. Please try again.'
        };
    }

    return {
        isValid: true,
        message: 'OTP verified successfully'
    };
};

/**
 * Generate a secure random token for password reset, etc.
 */
const generateSecureToken = (length = 32) => {
    return crypto.randomBytes(length).toString('hex');
};

module.exports = {
    generateOTP,
    generateOTPWithExpiry,
    verifyOTP,
    generateSecureToken
};
