const bcrypt = require('bcrypt');

/**
 * Validate password strength according to policy
 */
const validatePasswordStrength = (password) => {
    const errors = [];

    // Length check
    if (password.length < 8 || password.length > 32) {
        errors.push('Password must be between 8 and 32 characters');
    }

    // Uppercase letter check
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }

    // Lowercase letter check
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }

    // Number check
    if (!/\d/.test(password)) {
        errors.push('Password must contain at least one number');
    }

    // Special character (optional but recommended)
    // if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    //   errors.push('Password should contain at least one special character');
    // }

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Check if password contains personal information
 */
const containsPersonalInfo = (password, username, email) => {
    const lowerPassword = password.toLowerCase();
    const lowerUsername = username.toLowerCase();
    const emailLocal = email.split('@')[0].toLowerCase();

    // Check if password contains username
    if (lowerPassword.includes(lowerUsername) || lowerUsername.includes(lowerPassword)) {
        return true;
    }

    // Check if password contains email local part
    if (lowerPassword.includes(emailLocal) || emailLocal.includes(lowerPassword)) {
        return true;
    }

    return false;
};

/**
 * Check if password was used in the last N passwords
 */
const checkPasswordHistory = async (newPassword, passwordHistory) => {
    if (!passwordHistory || passwordHistory.length === 0) {
        return false;
    }

    // Check against last 5 passwords
    const historyToCheck = passwordHistory.slice(-5);

    for (const entry of historyToCheck) {
        const isMatch = await bcrypt.compare(newPassword, entry.password);
        if (isMatch) {
            return true;
        }
    }

    return false;
};

/**
 * Comprehensive password validation
 */
const validatePassword = async (password, user) => {
    const errors = [];

    // Check password strength
    const strengthCheck = validatePasswordStrength(password);
    if (!strengthCheck.isValid) {
        errors.push(...strengthCheck.errors);
    }

    // Check for personal information
    if (user && containsPersonalInfo(password, user.username, user.email)) {
        errors.push('Password must not contain your username or email');
    }

    // Check password history (if user exists and has history)
    if (user && user.passwordHistory) {
        const isReused = await checkPasswordHistory(password, user.passwordHistory);
        if (isReused) {
            errors.push('Password has been used recently. Please choose a different password');
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Add password to history (keep last 5)
 */
const addToPasswordHistory = (user, hashedPassword) => {
    if (!user.passwordHistory) {
        user.passwordHistory = [];
    }

    // Add new password to history
    user.passwordHistory.push({
        password: hashedPassword,
        changedAt: new Date()
    });

    // Keep only last 5 passwords
    if (user.passwordHistory.length > 5) {
        user.passwordHistory = user.passwordHistory.slice(-5);
    }

    // Update password change timestamp
    user.passwordLastChangedAt = new Date();
};

module.exports = {
    validatePasswordStrength,
    containsPersonalInfo,
    checkPasswordHistory,
    validatePassword,
    addToPasswordHistory
};
