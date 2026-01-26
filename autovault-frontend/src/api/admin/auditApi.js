import axios from '../Api';

export const getAuditLogs = (params) => {
    return axios.get('/admin/audit/logs', { params });
};

export const getAuditStats = () => {
    return axios.get('/admin/audit/stats');
};
