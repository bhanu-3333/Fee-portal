import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://fee-portal-2.onrender.com/api',
});

api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  // Log outgoing requests in development
  if (import.meta.env.DEV) {
    console.log(`🚀 [API Request] ${config.method?.toUpperCase()} ${config.url}`, config.data || '');
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`✅ [API Success] ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    const originalRequest = error.config;
    if (import.meta.env.DEV) {
      console.error(`❌ [API Error] ${error.response?.status} ${originalRequest.url}`, error.response?.data || error.message);
    }
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
