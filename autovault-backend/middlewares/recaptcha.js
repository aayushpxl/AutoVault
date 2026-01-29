const axios = require('axios');

/**
 * Middleware to verify Google reCAPTCHA v2 token
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

        // DEVELOPMENT BYPASS: Allow specific token to bypass check in development
        if (process.env.NODE_ENV === 'development' && recaptchaToken === 'dev-bypass-token') {
            console.log('ReCAPTCHA bypassed (Development Mode)');
            return next();
        }

        // Verify with Google reCAPTCHA API
        const verificationURL = 'https://www.google.com/recaptcha/api/siteverify';

        // Use URLSearchParams for application/x-www-form-urlencoded
        const params = new URLSearchParams();
        params.append('secret', process.env.RECAPTCHA_SECRET_KEY);
        params.append('response', recaptchaToken);

        const response = await axios.post(verificationURL, params);

        const { success, 'error-codes': errorCodes } = response.data;

        // Check if verification was successful
        if (!success) {
            console.error('reCAPTCHA verification failed:', errorCodes);
            console.log('Secret used:', process.env.RECAPTCHA_SECRET_KEY ? 'Present' : 'Missing');
            console.log('Token used:', recaptchaToken ? recaptchaToken.substring(0, 10) + '...' : 'Missing');

            return res.status(400).json({
                success: false,
                message: 'reCAPTCHA verification failed. Please try again.',
                errors: errorCodes // Return error codes for easier debugging
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
