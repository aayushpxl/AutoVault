const User = require("../models/User");
const VerificationToken = require("../models/VerificationToken");
const bcrypt = require("bcrypt");
const { validatePassword, addToPasswordHistory } = require("../utils/passwordValidator");
const { generateToken, setTokenCookie, clearTokenCookie } = require("../utils/jwtHandler");
const { logAudit } = require("../config/logger");
const { generateSecureToken } = require("../utils/otpGenerator");
const { sendVerificationEmail, sendWelcomeEmail } = require("../utils/emailService");

// Register User
exports.registerUser = async (req, res) => {
    let { username, email, password, role } = req.body;

    if (email) email = email.toLowerCase();

    // Basic field validation
    if (!username || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });
    }

    try {
        // Check if a user with the same username or email already exists
        const existingUser = await User.findOne({
            $or: [{ username }, { email }]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
        }

        // Validate password (strength, personal info, etc.)
        const passwordValidation = await validatePassword(password, { username, email, passwordHistory: [] });
        if (!passwordValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: passwordValidation.errors[0] || "Password validation failed",
                errors: passwordValidation.errors
            });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Determine if user is admin
        const userRole = role || 'normal';
        const isAdmin = userRole === 'admin';

        // Create a new user instance
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role: userRole,
            emailVerified: true, // All users are auto-verified as per new policy
            passwordHistory: [{
                password: hashedPassword,
                changedAt: new Date()
            }],
            passwordLastChangedAt: new Date()
        });

        // Save user to the database
        await newUser.save();

        // Mandatory email verification for normal users is now bypassed.
        // Users are encouraged to setup TOTP for enhanced security.

        // Log audit event
        logAudit('USER_REGISTERED', newUser._id, {
            username: newUser.username,
            email: newUser.email,
            role: newUser.role,
            autoVerified: isAdmin,
            ip: req.ip
        });

        // Return success message
        return res.status(201).json({
            success: true,
            message: isAdmin
                ? "Admin registration successful! You can now log in."
                : "Registration successful! You can now log in and manage your account.",
            requiresVerification: false
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// Login User
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    // Basic field validation
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Missing fields"
        });
    }

    try {
        // Find user by email or username (case-insensitive for email)
        const user = await User.findOne({
            $or: [
                { email: email.toLowerCase() },
                { username: email }
            ]
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        // Email verification block removed to prioritize MFA/TOTP setup flow
        /* 
        if (!user.isEmailVerified() && user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Please verify your email before logging in. Check your inbox for the verification link.",
                requiresVerification: true
            });
        }
        */

        // Check if account is locked
        if (user.isAccountLocked()) {
            const lockTime = Math.ceil((user.accountLockedUntil - Date.now()) / 60000);
            return res.status(403).json({
                success: false,
                message: `🚫 ACCOUNT LOCKED: Your account is temporarily locked due to multiple failed attempts or security violations. Try again in ${lockTime} minutes.`,
                securityStatus: 'BLOCKED'
            });
        }

        // Check account status
        if (user.accountStatus !== 'active') {
            return res.status(403).json({
                success: false,
                message: `Account is ${user.accountStatus}. Please contact support.`
            });
        }

        // Compare entered password with hashed password in DB
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            // Increment failed login attempts
            await user.incrementLoginAttempts();

            // Log failed login attempt
            logAudit('LOGIN_FAILED', user._id, {
                username: user.username,
                email: user.email,
                reason: 'Invalid password',
                ip: req.ip
            });

            return res.status(400).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        // Check if 2FA is enabled
        if (user.requiresMFA()) {
            // Reset failed login attempts since password was correct
            await user.resetLoginAttempts();

            if (user.mfaMethod === 'email') {
                // Generate and send email OTP
                const { generateOTPWithExpiry } = require('../utils/otpGenerator');
                const { sendMFAEmail } = require('../utils/emailService');

                const { code, expiry } = generateOTPWithExpiry(10); // 10 minutes

                user.otpCode = code;
                user.otpExpiry = expiry;
                user.otpAttempts = 0;
                await user.save();

                try {
                    await sendMFAEmail(user, code);
                } catch (error) {
                    console.error('Failed to send MFA email:', error);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to send verification code. Please try again.'
                    });
                }

                logAudit('MFA_OTP_SENT', user._id, {
                    username: user.username,
                    mfaMethod: 'email',
                    ip: req.ip
                });

                return res.status(200).json({
                    success: true,
                    requiresTwoFactor: true,
                    mfaMethod: 'email',
                    message: 'Verification code sent to your email',
                    userId: user._id
                });

            } else if (user.mfaMethod === 'totp') {
                // Require TOTP code
                return res.status(200).json({
                    success: true,
                    requiresTwoFactor: true,
                    mfaMethod: 'totp',
                    message: 'Please enter your authenticator code',
                    userId: user._id
                });
            }
        }

        // Reset failed login attempts on successful login
        await user.resetLoginAttempts();

        // Track login (detect new device)
        if (req.trackLogin) await req.trackLogin(user);

        // Update last login information
        user.lastLoginAt = new Date();
        user.lastLoginIP = req.ip;
        user.otpVerified = false; // Reset OTP verification for next login
        await user.save();

        // Generate JWT token
        const token = generateToken(user);

        // Set token in HttpOnly cookie
        setTokenCookie(res, token);

        // Convert user document to plain object and exclude sensitive fields
        const { password: _, passwordHistory, otpCode, twoFactorSecret, ...userData } = user.toObject();

        // Log successful login
        logAudit('LOGIN_SUCCESS', user._id, {
            username: user.username,
            email: user.email,
            ip: req.ip
        });

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: userData,
            token: token // Sending token for frontend fallback (improves dev reliability)
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// Logout User
exports.logoutUser = async (req, res) => {
    try {
        // Blacklist component (if token exists)
        const token = req.cookies.token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
        if (token) {
            const { addToBlacklist } = require('../utils/tokenBlacklist');
            addToBlacklist(token);
        }

        // Clear the token cookie
        clearTokenCookie(res);

        // Log logout event if user is authenticated
        if (req.user) {
            logAudit('LOGOUT', req.user._id, {
                username: req.user.username,
                ip: req.ip
            });
        }

        return res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// Verify Email
exports.verifyEmail = async (req, res) => {
    const { token } = req.params;

    try {
        // Find verification token
        const verificationToken = await VerificationToken.findOne({
            token,
            type: 'email_verification'
        });

        if (!verificationToken) {
            return res.status(400).json({
                success: false,
                message: "Invalid verification link"
            });
        }

        // Check if token has expired
        if (new Date() > verificationToken.expiresAt) {
            await VerificationToken.deleteOne({ _id: verificationToken._id });
            return res.status(400).json({
                success: false,
                message: "Verification link has expired. Please request a new one.",
                expired: true
            });
        }

        // Find and update user
        const user = await User.findById(verificationToken.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Check if already verified
        if (user.emailVerified) {
            return res.status(200).json({
                success: true,
                message: "Email is already verified. You can now log in.",
                alreadyVerified: true
            });
        }

        // Mark email as verified
        user.emailVerified = true;
        user.verificationToken = undefined;
        user.verificationExpiry = undefined;
        await user.save();

        // Delete verification token
        await VerificationToken.deleteOne({ _id: verificationToken._id });

        // Generate JWT token for auto-login
        const tokenForAutoLogin = generateToken(user);

        // Set token in HttpOnly cookie
        setTokenCookie(res, tokenForAutoLogin);

        // Convert user document to plain object and exclude sensitive fields
        const { password: _, passwordHistory, otpCode, twoFactorSecret, ...userData } = user.toObject();

        // Send welcome email
        try {
            await sendWelcomeEmail(user);
        } catch (emailError) {
            console.error('Welcome email failed:', emailError);
            // Continue even if welcome email fails
        }

        // Log audit event
        logAudit('EMAIL_VERIFIED', user._id, {
            username: user.username,
            email: user.email,
            ip: req.ip
        });

        return res.status(200).json({
            success: true,
            message: "Email verified successfully! You are now logged in.",
            data: userData,
            token: tokenForAutoLogin
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// Resend Verification Email
exports.resendVerification = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({
            success: false,
            message: "Email is required"
        });
    }

    try {
        // Find user
        const user = await User.findOne({ email });

        if (!user) {
            // Don't reveal if user exists
            return res.status(200).json({
                success: true,
                message: "If an account with this email exists and is unverified, a verification email has been sent."
            });
        }

        // Check if already verified
        if (user.emailVerified) {
            return res.status(400).json({
                success: false,
                message: "Email is already verified. You can log in to your account."
            });
        }

        // Delete old verification tokens
        await VerificationToken.deleteMany({
            userId: user._id,
            type: 'email_verification'
        });

        // Generate new verification token
        const verificationToken = generateSecureToken(32);
        const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Store new verification token
        await VerificationToken.create({
            userId: user._id,
            token: verificationToken,
            type: 'email_verification',
            expiresAt: tokenExpiry
        });

        // Update user
        user.verificationToken = verificationToken;
        user.verificationExpiry = tokenExpiry;
        await user.save();

        // Send verification email
        try {
            await sendVerificationEmail(user, verificationToken);
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            return res.status(500).json({
                success: false,
                message: "Failed to send verification email. Please try again later."
            });
        }

        // Log audit event
        logAudit('VERIFICATION_RESENT', user._id, {
            username: user.username,
            email: user.email,
            ip: req.ip
        });

        return res.status(200).json({
            success: true,
            message: "Verification email sent. Please check your inbox."
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};
