import axios from 'axios';

const apiInstance = axios.create({
  baseURL: '/api',
});

apiInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('dosje_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401 && !error.config?.url?.includes('/auth/login')) {
      localStorage.removeItem('dosje_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const api = {
  auth: {
    login: (email, password) => apiInstance.post('/auth/login', { email, password }),
    getMe: () => apiInstance.get('/auth/me'),
  },
  dashboard: {
    getStats: () => apiInstance.get('/dashboard/stats'),
    getMapData: () => apiInstance.get('/dashboard/map-data'),
    getRecentActivity: () => apiInstance.get('/dashboard/recent-activity'),
  },
  ngos: {
    getAll: () => apiInstance.get('/ngos'),
    getById: (id) => apiInstance.get(`/ngos/${id}`),
    updateNGO: (id, data) => apiInstance.put(`/ngos/${id}`, data),
    submitAttendance: (id, data) => apiInstance.post(`/ngos/${id}/attendance`, data),
    getCameras: (id) => apiInstance.get(`/ngos/${id}/cameras`),
  },
  inspections: {
    getAll: () => apiInstance.get('/inspections'),
    getById: (id) => apiInstance.get(`/inspections/${id}`),
    assign: (data) => apiInstance.post('/inspections/assign', data),
    aiAssign: () => apiInstance.post('/inspections/ai-assign'),
    start: (id, data) => apiInstance.put(`/inspections/${id}/start`, data),
    complete: (id, data) => apiInstance.put(`/inspections/${id}/complete`, data),
  },
  reports: {
    getAll: () => apiInstance.get('/reports'),
    getById: (id) => apiInstance.get(`/reports/${id}`),
    getByNGO: (ngo_id) => apiInstance.get(`/reports/ngo/${ngo_id}`),
  },
  analytics: {
    getAttendance: () => apiInstance.get('/analytics/attendance'),
    getAnomalies: () => apiInstance.get('/analytics/anomalies'),
    getCompliance: () => apiInstance.get('/analytics/compliance'),
    getAlerts: (params) => apiInstance.get('/analytics/alerts', { params }),
    markAlertRead: (id) => apiInstance.put(`/analytics/alerts/${id}/read`),
    getOverview: () => apiInstance.get('/analytics/overview'),
  },
};

export default api;
