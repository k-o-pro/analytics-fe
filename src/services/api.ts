import axios from 'axios';

const API_URL = process.env['REACT_APP_API_URL'] || 'https://api.analytics.k-o.pro';

const instance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add these settings for CORS
  withCredentials: true,
  validateStatus: (status) => {
    return status >= 200 && status < 500;
  }
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
    // Only attempt refresh if error is 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('401 error detected, attempting token refresh');
      originalRequest._retry = true;
      try {
        // Try to refresh token
        const refreshResponse = await instance.post('/auth/refresh');
        const { token } = refreshResponse.data;
        localStorage.setItem('token', token);
        console.log('Token refreshed successfully');
        
        // Retry original request with new token
        originalRequest.headers['Authorization'] = `Bearer ${token}`;
        return instance(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        
        // Check if we're in the OAuth flow
        const isOAuthFlow = window.location.pathname.includes('oauth-callback') || 
                           sessionStorage.getItem('pending_oauth_code') !== null;
        
        if (!isOAuthFlow) {
          console.log('Not in OAuth flow, clearing token');
          localStorage.removeItem('token');
          // Use React Router instead of direct location change to maintain state
          setTimeout(() => {
            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
          }, 100);
        } else {
          console.log('In OAuth flow, preserving token state');
          // Store the current URL to redirect back after login
          sessionStorage.setItem('oauth_redirect_url', window.location.href);
        }
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