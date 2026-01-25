const axios = require('axios');

/**
 * Middleware to verify Google reCAPTCHA v3 token
 * Requires RECAPTCHA_SECRET_KEY in environment variables
 */
const verifyRecaptcha = async (req, res, next) => {
    try {
        const { recaptchaToken } = req.body;

        // Check if token is provided
        if (!recaptchaToken) {
            return res.status(400).json({
                success: false,
                message: 'reCAPTCHA verification required'
            });
        }

        // Verify with Google reCAPTCHA API

        // DEVELOPMENT BYPASS: Allow specific token to bypass check in development
        if (process.env.NODE_ENV === 'development' && recaptchaToken === 'dev-bypass-token') {
            console.log('ReCAPTCHA bypassed (Development Mode)');
            return next();
        }

        const verificationURL = 'https://www.google.com/recaptcha/api/siteverify';
        const response = await axios.post(verificationURL, null, {
            params: {
                secret: process.env.RECAPTCHA_SECRET_KEY,
                response: recaptchaToken
            }
        });

        const { success, score, 'error-codes': errorCodes } = response.data;

        // Check if verification was successful
        if (!success) {
            console.error('reCAPTCHA verification failed:', errorCodes);
            return res.status(400).json({
                success: false,
                message: 'reCAPTCHA verification failed. Please try again.'
            });
        }

        // Check score (for reCAPTCHA v3)
        // Score ranges from 0.0 (likely bot) to 1.0 (likely human)
        const minimumScore = 0.5;
        if (score < minimumScore) {
            console.warn(`Low reCAPTCHA score: ${score} from IP: ${req.ip}`);
            return res.status(400).json({
                success: false,
                message: 'Suspicious activity detected. Please try again.'
            });
        }

        // Verification successful, continue to next middleware
        next();
    } catch (error) {
        console.error('reCAPTCHA verification error:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Error verifying reCAPTCHA. Please try again.'
        });
    }
};

module.exports = { verifyRecaptcha };
