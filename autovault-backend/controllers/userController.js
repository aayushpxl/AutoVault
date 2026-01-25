const User = require("../models/User");
const bcrypt = require("bcrypt");
const { validatePassword, addToPasswordHistory } = require("../utils/passwordValidator");
const { generateToken, setTokenCookie, clearTokenCookie } = require("../utils/jwtHandler");
const { logAudit } = require("../config/logger");

// Register User
exports.registerUser = async (req, res) => {
    const { username, email, password, role } = req.body;

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

        // Create a new user instance
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role: role || 'normal',
            passwordHistory: [{
                password: hashedPassword,
                changedAt: new Date()
            }],
            passwordLastChangedAt: new Date()
        });

        // Save user to the database
        await newUser.save();

        // Log audit event
        logAudit('USER_REGISTERED', newUser._id, {
            username: newUser.username,
            email: newUser.email,
            ip: req.ip
        });

        return res.status(201).json({
            success: true,
            message: "User registered successfully"
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
        // Find user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        // Check if account is locked
        if (user.isAccountLocked()) {
            const lockTime = Math.ceil((user.accountLockedUntil - Date.now()) / 60000);
            return res.status(403).json({
                success: false,
                message: `Account is locked due to multiple failed login attempts. Try again in ${lockTime} minutes.`
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
        if (user.twoFactorEnabled && !user.otpVerified) {
            // 2FA is enabled but OTP not verified yet
            // In a complete implementation, we would generate and send OTP here
            return res.status(200).json({
                success: true,
                requiresTwoFactor: true,
                message: "Please verify your OTP",
                userId: user._id // Temporary, for OTP verification
            });
        }

        // Reset failed login attempts on successful login
        await user.resetLoginAttempts();

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

