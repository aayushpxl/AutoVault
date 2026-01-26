const express = require('express');
const router = express.Router();
const { getAuditLogs, getAuditLogStats } = require('../../controllers/admin/auditLogController');
const { authenticateUser, isAdmin } = require('../../middlewares/authenticateUser');

// All routes require Admin privileges
router.use(authenticateUser, isAdmin);

// Get paginated logs
router.get('/logs', getAuditLogs);

// Get log statistics
router.get('/stats', getAuditLogStats);

module.exports = router;
