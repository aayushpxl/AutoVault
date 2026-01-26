import React, { useState, useEffect } from 'react';
import { getAuditLogs, getAuditStats } from '../../api/admin/auditApi';
import { FaSearch, FaFilter, FaInfoCircle, FaCalendarAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';

const AuditLogPage = () => {
    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedLog, setSelectedLog] = useState(null);

    // Filters
    const [actionFilter, setActionFilter] = useState('');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        fetchData();
    }, [page, actionFilter, statusFilter]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search) fetchData();
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [logsRes, statsRes] = await Promise.all([
                getAuditLogs({
                    page,
                    limit: 20,
                    action: actionFilter,
                    status: statusFilter,
                    search
                }),
                getAuditStats()
            ]);

            setLogs(logsRes.data.data);
            setTotalPages(logsRes.data.totalPages);
            setStats(statsRes.data.data);
        } catch (error) {
            toast.error('Failed to load audit data');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const statusColor = (status) => {
        switch (status) {
            case 'success': return 'bg-green-100 text-green-700';
            case 'failure': return 'bg-red-100 text-red-700';
            case 'warning': return 'bg-yellow-100 text-yellow-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Activity Logs</h1>
                <button onClick={fetchData} className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg">Refresh</button>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <p className="text-gray-500 text-xs uppercase font-bold">Total Events Today</p>
                        <p className="text-2xl font-bold text-blue-600">{stats.totalToday}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <p className="text-gray-500 text-xs uppercase font-bold">Failures Today</p>
                        <p className="text-2xl font-bold text-red-600">{stats.failuresToday}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border col-span-2">
                        <p className="text-gray-500 text-xs uppercase font-bold mb-2">Top Actions</p>
                        <div className="flex gap-2 flex-wrap">
                            {stats.topActions.map(action => (
                                <span key={action._id} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                    {action._id}: <strong>{action.count}</strong>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border mb-6 flex flex-wrap gap-4 items-center">
                <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50 w-full sm:w-64">
                    <FaSearch className="text-gray-400 mr-2" />
                    <input
                        type="text"
                        placeholder="Search user or action..."
                        className="bg-transparent focus:outline-none w-full text-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <FaFilter className="text-gray-400" />
                    <select
                        className="border rounded-lg px-3 py-2 text-sm focus:outline-blue-500"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value="success">Success</option>
                        <option value="failure">Failure</option>
                    </select>
                </div>

                <button onClick={() => { setSearch(''); setActionFilter(''); setStatusFilter(''); }} className="text-sm text-blue-600 hover:underline">
                    Clear Filters
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-700">Timestamp</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Action</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">User</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">IP Address</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Status</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {loading ? (
                                <tr><td colSpan="6" className="text-center py-8">Loading logs...</td></tr>
                            ) : logs.length === 0 ? (
                                <tr><td colSpan="6" className="text-center py-8 text-gray-500">No logs found matching your criteria.</td></tr>
                            ) : (
                                logs.map(log => (
                                    <tr key={log._id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                                            {new Date(log.timestamp).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {log.action}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {log.username || 'System/Guest'}
                                            {log.userId && <span className="text-xs text-gray-400 block font-mono">{log.userId.substring(0, 8)}...</span>}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                                            {log.ip}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor(log.status)}`}>
                                                {log.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => setSelectedLog(log)}
                                                className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                                            >
                                                <FaInfoCircle /> View
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex justify-between items-center px-6 py-4 border-t bg-gray-50">
                    <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
                    <div className="flex gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            className="px-3 py-1 border rounded bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            className="px-3 py-1 border rounded bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* Log Details Modal */}
            {selectedLog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                        <div className="p-6 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
                            <h3 className="text-lg font-bold">Log Details</h3>
                            <button onClick={() => setSelectedLog(null)} className="text-gray-400 hover:text-black text-xl">&times;</button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Action</p>
                                    <p className="font-mono bg-gray-100 p-2 rounded mt-1 text-sm">{selectedLog.action}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Timestamp</p>
                                    <p className="font-mono bg-gray-100 p-2 rounded mt-1 text-sm">{new Date(selectedLog.timestamp).toISOString()}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">User Agent</p>
                                    <p className="font-mono bg-gray-100 p-2 rounded mt-1 text-xs truncate" title={selectedLog.userAgent}>{selectedLog.userAgent}</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold mb-2">Details JSON</p>
                                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs font-mono">
                                    {JSON.stringify(selectedLog.details, null, 2)}
                                </pre>
                            </div>
                        </div>
                        <div className="p-4 border-t bg-gray-50 rounded-b-xl text-right">
                            <button onClick={() => setSelectedLog(null)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuditLogPage;
