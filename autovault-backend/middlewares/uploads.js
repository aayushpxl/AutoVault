const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

/**
 * Sanitize filename to prevent directory traversal and other attacks
 */
const sanitizeFilename = (filename) => {
    // Remove any path separators and null bytes
    return filename
        .replace(/\.\./g, '')
        .replace(/[/\\]/g, '')
        .replace(/\x00/g, '')
        .replace(/[^a-zA-Z0-9._-]/g, '_');
};

/**
 * Validate file extension (prevent double-extension attacks)
 */
const isValidExtension = (filename) => {
    const parts = filename.toLowerCase().split('.');

    // Check for multiple extensions (e.g., file.php.jpg)
    if (parts.length > 2) {
        return false;
    }

    const ext = parts[parts.length - 1];
    const allowedExts = ['jpg', 'jpeg', 'png', 'webp'];

    return allowedExts.includes(ext);
};

// Set storage engine
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Make sure this folder exists
    },
    filename: (req, file, cb) => {
        // Sanitize original filename
        const sanitized = sanitizeFilename(file.originalname);

        // Check for null bytes in filename
        if (sanitized.includes('\x00')) {
            return cb(new Error('Invalid filename'));
        }

        // Validate extension
        if (!isValidExtension(sanitized)) {
            return cb(new Error('Invalid file extension'));
        }

        const ext = path.extname(sanitized).toLowerCase();
        // Use UUID for unique filename
        cb(null, `${uuidv4()}${ext}`);
    }
});

// Enhanced file filter with strict MIME type validation
const fileFilter = (req, file, cb) => {
    // Allowed MIME types
    const allowedMimeTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp'
    ];

    // Allowed file extensions
    const allowedExtensions = /jpeg|jpg|png|webp/;

    // Sanitize filename
    const sanitizedFilename = sanitizeFilename(file.originalname);

    // Check extension
    const extname = allowedExtensions.test(path.extname(sanitizedFilename).toLowerCase());

    // Check MIME type
    const mimetype = allowedMimeTypes.includes(file.mimetype);

    // Both must match to be valid
    if (extname && mimetype) {
        return cb(null, true);
    }

    // Reject file with detailed error
    const errorMsg = !mimetype
        ? `Invalid file type. Only JPEG, PNG, and WebP images are allowed.`
        : `Invalid file extension.`;

    cb(new Error(errorMsg));
};

// Create multer upload instance
const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max
        files: 1 // Only one file at a time
    },
    fileFilter
});

// Error handling middleware for multer
const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File size too large. Maximum size is 5MB.'
            });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                message: 'Too many files. Only one file allowed.'
            });
        }
        return res.status(400).json({
            success: false,
            message: `Upload error: ${err.message}`
        });
    }

    if (err) {
        return res.status(400).json({
            success: false,
            message: err.message || 'File upload failed'
        });
    }

    next();
};

module.exports = { upload, handleUploadError };
