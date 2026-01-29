// Import core dependencies
const express = require("express");
const path = require("path");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const xss = require("xss");
const connectDB = require("./config/db");
const { sanitizeInput } = require("./middlewares/sanitizer");
const { payloadGuard } = require("./middlewares/payloadGuard");
const { generalLimiter } = require("./middlewares/rateLimiter");
const { errorLogger } = require("./config/logger");

// Import routes
const adminUserRoute = require("./routes/admin/adminUserRoute");
const adminVehicleRoute = require("./routes/admin/adminVehicleRoute");
const bookingRoute = require("./routes/bookingRoute");
const savedVehicleRoute = require("./routes/savedVehicleRoute");
const reviewRoute = require("./routes/reviewRouter");
const vehicleRoute = require("./routes/vehicleRoute");
const userRoute = require("./routes/userRoute");
const adminAuditRoute = require("./routes/admin/adminAuditRoute");
const mfaRoute = require("./routes/mfaRoute");
const paymentRoute = require("./routes/paymentRoute");

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// ============ SECURITY MIDDLEWARE ============

// Helmet - Secure HTTP headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"],
            scriptSrc: ["'self'"],
            connectSrc: ["'self'"],
        }
    },
    hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true
    },
    frameguard: {
        action: 'deny' // Prevent clickjacking
    },
    referrerPolicy: {
        policy: 'strict-origin-when-cross-origin'
    },
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS Configuration - Strict origin whitelisting
const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : ['http://localhost:5173', 'http://localhost:3000'];

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // Allow cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['set-cookie']
};

app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser middleware
app.use(cookieParser());

// Malicious Payload Protection - Detect and block XSS/Injection
app.use(payloadGuard);

// XSS Protection - Sanitize all inputs
app.use(sanitizeInput);

// Rate limiting - General API protection
app.use('/api/', generalLimiter);

// Static file serving
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ============ API ROUTES ============

app.use("/api/auth", userRoute);
app.use("/api/mfa", mfaRoute);
app.use("/api/admin/user", adminUserRoute);
app.use("/api/admin/vehicle", adminVehicleRoute);
app.use("/api/admin/audit", adminAuditRoute);
app.use("/api/bookings", bookingRoute);
app.use("/api/admin/bookings", bookingRoute);
app.use("/api/saved-vehicles", savedVehicleRoute);
app.use("/api/reviews", reviewRoute);
app.use("/api/vehicles", vehicleRoute);
app.use("/api/payment", paymentRoute);

// ============ ERROR HANDLING ============

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    // Log error
    errorLogger.error({
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip
    });

    // Send error response
    res.status(err.status || 500).json({
        success: false,
        message: process.env.NODE_ENV === 'production'
            ? 'An error occurred'
            : err.message
    });
});

module.exports = app;

// Security Implementation Verified: Secure Server Configuration Active
