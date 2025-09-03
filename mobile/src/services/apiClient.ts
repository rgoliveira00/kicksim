import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import Config from 'react-native-config';
import { store } from '@/store';
import { refreshToken, clearAuth } from '@/store/slices/authSlice';
import { storageService } from './storageService';

// API configuration
const API_BASE_URL = Config.API_BASE_URL || 'http://localhost:3000/api/v1';
const API_TIMEOUT = 30000; // 30 seconds

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config: AxiosRequestConfig) => {
    const state = store.getState();
    const accessToken = state.auth.tokens?.accessToken;
    
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    
    // Add request timestamp for debugging
    if (__DEV__) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
        headers: config.headers,
        data: config.data,
        params: config.params,
      });
    }
    
    return config;
  },
  (error: AxiosError) => {
    if (__DEV__) {
      console.error('[API Request Error]', error);
    }
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh and errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    if (__DEV__) {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    if (__DEV__) {
      console.error('[API Response Error]', {
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data,
      });
    }
    
    // Handle 401 Unauthorized - attempt token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const state = store.getState();
      const currentRefreshToken = state.auth.tokens?.refreshToken;
      
      if (currentRefreshToken) {
        try {
          // Attempt to refresh token
          await store.dispatch(refreshToken()).unwrap();
          
          // Retry original request with new token
          const newState = store.getState();
          const newAccessToken = newState.auth.tokens?.accessToken;
          
          if (newAccessToken && originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          // Refresh failed, clear auth and redirect to login
          store.dispatch(clearAuth());
          await storageService.clearTokens();
          
          // You might want to navigate to login screen here
          // This would typically be handled by a navigation service
          console.warn('Token refresh failed, user needs to re-authenticate');
        }
      } else {
        // No refresh token available, clear auth
        store.dispatch(clearAuth());
        await storageService.clearTokens();
      }
    }
    
    // Handle network errors
    if (!error.response) {
      const networkError = new Error('Network error - please check your connection');
      networkError.name = 'NetworkError';
      return Promise.reject(networkError);
    }
    
    // Handle rate limiting
    if (error.response.status === 429) {
      const rateLimitError = new Error('Too many requests - please try again later');
      rateLimitError.name = 'RateLimitError';
      return Promise.reject(rateLimitError);
    }
    
    // Handle server errors
    if (error.response.status >= 500) {
      const serverError = new Error('Server error - please try again later');
      serverError.name = 'ServerError';
      return Promise.reject(serverError);
    }
    
    return Promise.reject(error);
  }
);

// Helper functions for common HTTP methods
export const api = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    apiClient.get(url, config),
    
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    apiClient.post(url, data, config),
    
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    apiClient.put(url, data, config),
    
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    apiClient.patch(url, data, config),
    
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    apiClient.delete(url, config),
};

// Upload helper for multipart/form-data
export const uploadFile = async (
  url: string,
  file: FormData,
  onUploadProgress?: (progressEvent: any) => void
): Promise<AxiosResponse> => {
  return apiClient.post(url, file, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress,
  });
};

// Download helper
export const downloadFile = async (
  url: string,
  onDownloadProgress?: (progressEvent: any) => void
): Promise<AxiosResponse> => {
  return apiClient.get(url, {
    responseType: 'blob',
    onDownloadProgress,
  });
};

export { apiClient };

