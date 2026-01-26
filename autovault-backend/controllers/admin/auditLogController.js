const AuditLog = require('../../models/AuditLog');
const User = require('../../models/User');

/**
 * Get Audit Logs with Pagination and Filtering
 */
exports.getAuditLogs = async (req, res) => {
    console.log('=== AUDIT LOG REQUEST ===');
    console.log('Query params:', req.query);

    try {
        const {
            page = 1,
            limit = 20,
            action,
            userId,
            status,
            startDate,
            endDate,
            search
        } = req.query;

        console.log('Parsed params:', { page, limit, action, userId, status, startDate, endDate, search });

        const query = {};

        // Filters (check for non-empty strings)
        if (action && action.trim()) query.action = action;
        if (userId) query.userId = userId;
        if (status && status.trim()) query.status = status;

        // Date Range
        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) query.timestamp.$gte = new Date(startDate);
            if (endDate) query.timestamp.$lte = new Date(endDate);
        }

        // Search (simple text search on username or regex on action)
        if (search && search.trim()) {
            query.$or = [
                { username: { $regex: search.trim(), $options: 'i' } },
                { action: { $regex: search.trim(), $options: 'i' } }
            ];
        }

        console.log('MongoDB Query:', JSON.stringify(query));

        const logs = await AuditLog.find(query)
            .sort({ timestamp: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        console.log('Found logs:', logs.length);

        const total = await AuditLog.countDocuments(query);

        console.log('Total count:', total);

        res.status(200).json({
            success: true,
            count: logs.length,
            total,
            totalPages: Math.ceil(total / parseInt(limit)),
            currentPage: parseInt(page),
            data: logs
        });

    } catch (error) {
        console.error('=== ERROR IN AUDIT LOGS ===');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        console.error('========================');
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get Audit Log Statistics
 * For Admin Dashboard widgets
 */
exports.getAuditLogStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const stats = await AuditLog.aggregate([
            {
                $match: {
                    timestamp: { $gte: today }
                }
            },
            {
                $group: {
                    _id: '$status', // Group by success/failure
                    count: { $sum: 1 }
                }
            }
        ]);

        const actionStats = await AuditLog.aggregate([
            {
                $match: {
                    timestamp: { $gte: today }
                }
            },
            {
                $group: {
                    _id: '$action',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        const formattedStats = {
            totalToday: stats.reduce((acc, curr) => acc + curr.count, 0),
            successToday: stats.find(s => s._id === 'success')?.count || 0,
            failuresToday: stats.find(s => s._id === 'failure')?.count || 0,
            topActions: actionStats
        };

        res.status(200).json({
            success: true,
            data: formattedStats
        });

    } catch (error) {
        console.error('Error fetching log stats:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
