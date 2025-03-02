import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://api.analytics.k-o.pro';

const instance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for API calls
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Try to refresh token
        const refreshResponse = await instance.post('/auth/refresh');
        const { token } = refreshResponse.data;
        localStorage.setItem('token', token);
        
        // Retry original request with new token
        originalRequest.headers['Authorization'] = `Bearer ${token}`;
        return instance(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export const api = {
  get: <T>(url: string, params?: any) => 
    instance.get<T>(url, { params }),
  
  post: <T>(url: string, data?: any) => 
    instance.post<T>(url, data),
  
  put: <T>(url: string, data?: any) => 
    instance.put<T>(url, data),
  
  delete: <T>(url: string) => 
    instance.delete<T>(url),
  
  setAuthToken: (token: string) => {
    if (token) {
      instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete instance.defaults.headers.common['Authorization'];
    }
  }
};