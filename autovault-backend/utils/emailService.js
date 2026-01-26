const nodemailer = require('nodemailer');

/**
 * Email Service
 * Centralized email functionality for authentication system
 */

// Create reusable transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Verify transporter configuration
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Email service configuration error:', error.message);
        console.warn('⚠️ Make sure EMAIL_USER and EMAIL_PASS are set in .env');
    } else {
        console.log('✅ Email service is ready');
    }
});

/**
 * Send email verification link
 */
const sendVerificationEmail = async (user, token) => {
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${token}`;

    const mailOptions = {
        from: `"AutoVault" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Verify Your AutoVault Account',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <h1 style="color: #2563eb; margin-bottom: 20px;">Welcome to AutoVault! 🚗</h1>
                    
                    <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                        Hi <strong>${user.username}</strong>,
                    </p>
                    
                    <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                        Thanks for registering with AutoVault! To complete your registration and start using your account, 
                        please verify your email address by clicking the button below.
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verificationUrl}" 
                           style="display: inline-block; padding: 14px 32px; background-color: #2563eb; color: #ffffff; 
                                  text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                            Verify Email Address
                        </a>
                    </div>
                    
                    <p style="font-size: 14px; color: #666; margin-top: 20px;">
                        Or copy and paste this link into your browser:
                    </p>
                    <p style="font-size: 14px; color: #2563eb; word-break: break-all;">
                        ${verificationUrl}
                    </p>
                    
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                    
                    <p style="font-size: 12px; color: #999; margin-top: 20px;">
                        ⏰ This link will expire in <strong>24 hours</strong> for security reasons.
                    </p>
                    
                    <p style="font-size: 12px; color: #999;">
                        If you didn't create an account with AutoVault, you can safely ignore this email.
                    </p>
                    
                    <p style="font-size: 12px; color: #999; margin-top: 30px;">
                        — The AutoVault Team
                    </p>
                </div>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Verification email sent to:', user.email);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error sending verification email:', error);
        throw new Error('Failed to send verification email');
    }
};

/**
 * Send welcome email after successful verification
 */
const sendWelcomeEmail = async (user) => {
    const mailOptions = {
        from: `"AutoVault" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: '🎉 Welcome to AutoVault - Your Account is Now Active!',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <h1 style="color: #10b981; margin-bottom: 20px;">🎉 Your Account is Verified!</h1>
                    
                    <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                        Hi <strong>${user.username}</strong>,
                    </p>
                    
                    <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                        Great news! Your email has been successfully verified and your AutoVault account is now fully active.
                    </p>
                    
                    <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0;">
                        <h3 style="color: #059669; margin-top: 0;">What's Next?</h3>
                        <ul style="color: #333; line-height: 1.8;">
                            <li>Complete your profile</li>
                            <li>Browse available vehicles</li>
                            <li>Set up two-factor authentication for extra security</li>
                            <li>Start booking your dream vehicle</li>
                        </ul>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.CLIENT_URL}/login" 
                           style="display: inline-block; padding: 14px 32px; background-color: #2563eb; color: #ffffff; 
                                  text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                            Login to Your Account
                        </a>
                    </div>
                    
                    <p style="font-size: 14px; color: #666; margin-top: 30px;">
                        If you have any questions or need assistance, feel free to reach out to our support team.
                    </p>
                    
                    <p style="font-size: 12px; color: #999; margin-top: 30px;">
                        — The AutoVault Team
                    </p>
                </div>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Welcome email sent to:', user.email);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error sending welcome email:', error);
        // Don't throw here - welcome email is not critical
        return { success: false, error: error.message };
    }
};

/**
 * Send MFA OTP via email
 */
const sendMFAEmail = async (user, otp) => {
    const mailOptions = {
        from: `"AutoVault Security" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Your AutoVault Login Verification Code',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <h1 style="color: #2563eb; margin-bottom: 20px;">🔐 Login Verification Code</h1>
                    
                    <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                        Hi <strong>${user.username}</strong>,
                    </p>
                    
                    <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                        A login attempt was made to your AutoVault account. Please use the verification code below to complete your login:
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <div style="display: inline-block; background-color: #f3f4f6; padding: 20px 40px; 
                                    border-radius: 8px; border: 2px dashed #2563eb;">
                            <span style="font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 8px;">
                                ${otp}
                            </span>
                        </div>
                    </div>
                    
                    <p style="font-size: 14px; color: #666; text-align: center; margin-top: 20px;">
                        ⏰ This code will expire in <strong>10 minutes</strong>
                    </p>
                    
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                    
                    <div style="background-color: #fef2f2; padding: 15px; border-radius: 6px; border-left: 4px solid #ef4444;">
                        <p style="font-size: 14px; color: #991b1b; margin: 0;">
                            <strong>⚠️ Security Alert:</strong> If you didn't request this code, someone may be trying to access your account. 
                            Please change your password immediately.
                        </p>
                    </div>
                    
                    <p style="font-size: 12px; color: #999; margin-top: 30px;">
                        — The AutoVault Security Team
                    </p>
                </div>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ MFA OTP sent to:', user.email);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error sending MFA email:', error);
        throw new Error('Failed to send MFA code');
    }
};

/**
 * Send password reset email (refactored from existing code)
 */
const sendPasswordResetEmail = async (user, token) => {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;

    const mailOptions = {
        from: `"AutoVault Support" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Reset Your AutoVault Password',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <h1 style="color: #2563eb; margin-bottom: 20px;">🔑 Password Reset Request</h1>
                    
                    <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                        Hi <strong>${user.username}</strong>,
                    </p>
                    
                    <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                        We received a request to reset your password for your AutoVault account.
                    </p>
                    
                    <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                        Click the button below to reset your password. This link will expire in <strong>15 minutes</strong> for your security.
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" 
                           style="display: inline-block; padding: 14px 32px; background-color: #2563eb; color: #ffffff; 
                                  text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                            Reset Password
                        </a>
                    </div>
                    
                    <p style="font-size: 14px; color: #666; margin-top: 20px;">
                        Or copy and paste this link into your browser:
                    </p>
                    <p style="font-size: 14px; color: #2563eb; word-break: break-all;">
                        ${resetUrl}
                    </p>
                    
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                    
                    <p style="font-size: 14px; color: #666;">
                        If you didn't request this, you can safely ignore this email. Your password will remain unchanged.
                    </p>
                    
                    <p style="font-size: 12px; color: #999; margin-top: 30px;">
                        — The AutoVault Support Team
                    </p>
                </div>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Password reset email sent to:', user.email);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error sending password reset email:', error);
        throw new Error('Failed to send password reset email');
    }
};

/**
 * Send new device login notification
 */
const sendNewDeviceNotification = async (user, loginDetails) => {
    const { ip, userAgent, timestamp } = loginDetails;

    const mailOptions = {
        from: `"AutoVault Security" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: '🔔 New Login Detected on Your Account',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <h1 style="color: #f59e0b; margin-bottom: 20px;">🔔 New Login Detected</h1>
                    
                    <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                        Hi <strong>${user.username}</strong>,
                    </p>
                    
                    <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                        We detected a new login to your AutoVault account from a device or location we don't recognize.
                    </p>
                    
                    <div style="background-color: #fffbeb; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
                        <h3 style="color: #d97706; margin-top: 0;">Login Details:</h3>
                        <p style="color: #333; margin: 5px 0;"><strong>Time:</strong> ${new Date(timestamp).toLocaleString()}</p>
                        <p style="color: #333; margin: 5px 0;"><strong>IP Address:</strong> ${ip}</p>
                        <p style="color: #333; margin: 5px 0;"><strong>Device:</strong> ${userAgent}</p>
                    </div>
                    
                    <p style="font-size: 16px; color: #333; margin: 20px 0;">
                        If this was you, you can ignore this email. If you don't recognize this activity:
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.CLIENT_URL}/reset-password" 
                           style="display: inline-block; padding: 14px 32px; background-color: #ef4444; color: #ffffff; 
                                  text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                            Secure My Account
                        </a>
                    </div>
                    
                    <p style="font-size: 12px; color: #999; margin-top: 30px;">
                        — The AutoVault Security Team
                    </p>
                </div>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ New device notification sent to:', user.email);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error sending new device notification:', error);
        // Don't throw - this is informational
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendVerificationEmail,
    sendWelcomeEmail,
    sendMFAEmail,
    sendPasswordResetEmail,
    sendNewDeviceNotification
};
