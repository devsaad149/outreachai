import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
});

export const getLeads = () => api.get('/leads');
export const previewCSV = (formData) => api.post('/leads/preview', formData);
export const uploadLeads = (formData) => api.post('/leads/upload', formData);
export const startCampaign = () => api.post('/campaign/start');
export const getAuthUrl = () => api.get('/auth/url');

export default api;
