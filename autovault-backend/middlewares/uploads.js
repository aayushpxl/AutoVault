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
 * Validate file extension (prevent double-extension attacks while allowing dots in names)
 */
const isValidExtension = (filename) => {
    const parts = filename.toLowerCase().split('.');
    if (parts.length < 2) return false;

    const ext = parts[parts.length - 1];
    const allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

    // Double extension protection: Check if any part before the last one is a dangerous extension
    const dangerousExts = ['php', 'js', 'html', 'htm', 'exe', 'sh', 'bat', 'jsp', 'asp'];
    const hasDangerousPart = parts.slice(0, -1).some(part => dangerousExts.includes(part));

    if (hasDangerousPart) {
        return false;
    }

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
        'image/webp',
        'image/gif'
    ];

    // Allowed file extensions (anchored for security)
    const allowedExtensions = /^\.(jpeg|jpg|png|webp|gif)$/;

    // Sanitize filename
    const sanitizedFilename = sanitizeFilename(file.originalname);
    const extension = path.extname(sanitizedFilename).toLowerCase();

    // Check extension
    const isExtensionValid = allowedExtensions.test(extension);

    // Check MIME type
    const isMimetypeValid = allowedMimeTypes.includes(file.mimetype);

    if (process.env.NODE_ENV === 'development') {
        console.log('--- Upload Debug ---');
        console.log('Original Name:', file.originalname);
        console.log('Sanitized Name:', sanitizedFilename);
        console.log('Extension:', extension);
        console.log('MIME Type:', file.mimetype);
        console.log('Is Extension Valid:', isExtensionValid);
        console.log('Is MIME Valid:', isMimetypeValid);
    }

    // Both must match to be valid
    if (isExtensionValid && isMimetypeValid) {
        return cb(null, true);
    }

    // Reject file with detailed error
    const errorMsg = !isMimetypeValid
        ? `Invalid file type (${file.mimetype}). Only JPEG, PNG, GIF, and WebP are allowed.`
        : `Invalid file extension (${extension}).`;

    cb(new Error(errorMsg));
};

// Create multer upload instance
const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max
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
                message: 'File size too large. Maximum size is 10MB.'
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
