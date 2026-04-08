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
    return response;
  },
  (error) => {
    // Global handling for 401 Unauthorized errors (e.g., token expired)
    if (error.response && error.response.status === 401) {
      console.warn('Session expired. Redirecting to login...');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Pass errors through for component-level specific handling
    return Promise.reject(error);
  }
);

export default api;
