import axios from 'axios';

// Base URL từ environment hoặc mặc định. Ensure it points to the
// server API root (append '/api' if not provided) so frontend calls
// like '/bookings/me' resolve to e.g. 'http://localhost:3000/api/bookings/me'.
const rawBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';
// Normalize base and ensure a single /api suffix. If the provided
// VITE_API_URL already points to the API root (contains '/api'),
// don't append another '/api'.
const normalized = String(rawBase).replace(/\/$/, '');
const API_BASE_URL = /\/api(\/?$)/i.test(normalized)
  ? normalized
  : normalized + '/api';

// Tạo axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  withCredentials: true, // Enable sending cookies
});

// Request interceptor - Thêm token vào header
apiClient.interceptors.request.use(
  (config) => {
    // Normalize request URL: if a request path accidentally begins
    // with '/api', strip that prefix so it will be appended to
    // our baseURL exactly once. This prevents double '/api/api'
    // when code uses absolute '/api/...' paths.
    if (config.url && typeof config.url === 'string') {
      if (config.url.startsWith('/api/')) {
        config.url = config.url.replace(/^\/api/, '');
      }
      // Also avoid accidental double slashes after concatenation
      config.url = config.url.replace(/\/\/+/, '/');
    }

    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Xử lý lỗi chung và auto-refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error);
      // You can show a toast notification here
      return Promise.reject({
        ...error,
        message: 'Lỗi kết nối mạng. Vui lòng kiểm tra ' +
          'kết nối internet của bạn.',
      });
    }

    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      // Không redirect nếu đang ở trang login/register
      const isAuthEndpoint = error.config?.url?.includes('/auth/login') ||
                 error.config?.url?.includes('/auth/register') ||
                 error.config?.url?.includes('/auth/refresh-token');
      
      if (!isAuthEndpoint && localStorage.getItem('rememberMe') === 'true') {
        // Try to refresh token
        originalRequest._retry = true;

        try {
          const response = await apiClient.post('/auth/refresh-token');
          
          if (response.data?.data?.token) {
            const newToken = response.data.data.token;
            localStorage.setItem('token', newToken);
            
            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          // Refresh failed, logout user
          localStorage.removeItem('token');
          localStorage.removeItem('userInfo');
          localStorage.removeItem('rememberMe');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else if (!isAuthEndpoint) {
        // Token hết hạn và không có rememberMe
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        localStorage.removeItem('rememberMe');
        window.location.href = '/login';
      }
    }

    // Handle other HTTP errors
    if (error.response?.status >= 500) {
      console.error('Server error:', error);
      return Promise.reject({
        ...error,
        message: 'Lỗi máy chủ. Vui lòng thử lại sau.',
      });
    }

    return Promise.reject(error);
  }
);

export default apiClient;
