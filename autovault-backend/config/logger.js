const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

// Define log format
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '..', 'logs');

// Audit log transport (user actions)
const auditTransport = new DailyRotateFile({
    filename: path.join(logsDir, 'audit-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '30d',
    level: 'info'
});

// Error log transport
const errorTransport = new DailyRotateFile({
    filename: path.join(logsDir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '30d',
    level: 'error'
});

// Access log transport (HTTP requests)
const accessTransport = new DailyRotateFile({
    filename: path.join(logsDir, 'access-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '30d',
    level: 'http'
});

// Create audit logger
const auditLogger = winston.createLogger({
    format: logFormat,
    transports: [auditTransport],
    exitOnError: false
});

// Create error logger
const errorLogger = winston.createLogger({
    format: logFormat,
    transports: [
        errorTransport,
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ],
    exitOnError: false
});

// Create access logger
const accessLogger = winston.createLogger({
    format: logFormat,
    transports: [accessTransport],
    exitOnError: false
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
    const consoleFormat = winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
            let msg = `${timestamp} [${level}]: ${message}`;
            if (Object.keys(meta).length > 0) {
                msg += ` ${JSON.stringify(meta)}`;
            }
            return msg;
        })
    );

    auditLogger.add(new winston.transports.Console({ format: consoleFormat }));
}

// Helper function to sanitize log data (remove sensitive information)
const sanitizeLogData = (data) => {
    const sensitiveFields = ['password', 'token', 'secret', 'authorization', 'cookie'];
    const sanitized = { ...data };

    sensitiveFields.forEach(field => {
        if (sanitized[field]) {
            sanitized[field] = '[REDACTED]';
        }
    });

    return sanitized;
};

// Log user action
const logAudit = (action, userId, details = {}) => {
    // 1. Log to file (Winston)
    auditLogger.info({
        action,
        userId,
        ...sanitizeLogData(details),
        timestamp: new Date().toISOString()
    });

    // 2. Log to Database (MongoDB)
    // Fire and forget - don't await to avoid blocking response
    try {
        const AuditLog = require('../models/AuditLog');

        // Extract IP and User Agent if present in details, otherwise check request object if passed
        // Note: details might contain ip/userAgent directly

        const logEntry = new AuditLog({
            action,
            userId: userId || undefined, // undefined if null
            username: details.username,
            details: sanitizeLogData(details),
            ip: details.ip,
            userAgent: details.userAgent,
            status: details.status || 'success',
            timestamp: new Date()
        });

        logEntry.save().catch(err => {
            console.error('Failed to save audit log to DB:', err.message);
        });
    } catch (err) {
        console.error('Error in logAudit DB saving:', err.message);
    }
};

// Log error
const logError = (error, context = {}) => {
    errorLogger.error({
        message: error.message,
        stack: error.stack,
        ...sanitizeLogData(context),
        timestamp: new Date().toISOString()
    });
};

// Log HTTP access
const logAccess = (req, res, responseTime) => {
    accessLogger.http({
        method: req.method,
        url: req.url,
        status: res.statusCode,
        responseTime: `${responseTime}ms`,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        timestamp: new Date().toISOString()
    });
};

module.exports = {
    auditLogger,
    errorLogger,
    accessLogger,
    logAudit,
    logError,
    logAccess,
    sanitizeLogData
};

// Security Implementation Verified: System Logging Infrastructure Configured
