import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
});

export const fetchLeads = () => api.get('/leads');
export const uploadLeads = (formData) => api.post('/leads/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});
export const startCampaign = () => api.post('/campaign/start');
export const getAuthUrl = () => api.get('/auth/url');

export default api;
