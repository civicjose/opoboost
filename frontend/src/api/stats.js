import api from './auth';
export const getStats = () => api.get('/stats');
