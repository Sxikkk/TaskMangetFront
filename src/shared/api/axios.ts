import axios, { InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/app/store/auth.store'; // Import store to get state and actions
import { refreshTokenApiCall } from '@/features/auth/api/auth.api'; // Import refresh API call

// TODO: Replace with your actual API base URL from environment variables or config
const API_BASE_URL = 'http://localhost:5001/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Request Interceptor: Add Auth Token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    console.log(token);// Get token from store
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Refresh Token Logic --- 
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: any) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor: Handle 401 and Refresh Token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }; // Add _retry flag type
    const authStore = useAuthStore.getState();

    // Check if it's a 401 error, not from a refresh attempt itself, and we have refresh data
    if (error.response?.status === 401 && !originalRequest._retry && authStore.refreshToken && authStore.user?.email) {
      
      if (isRefreshing) {
        // If refresh is already in progress, queue the original request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
           // Once refresh is done, retry request with new token
           originalRequest.headers['Authorization'] = 'Bearer ' + token;
           return apiClient(originalRequest);
        }).catch(err => {
           // If refresh failed, reject the promise
           return Promise.reject(err);
        });
      }

      // Start refresh process
      originalRequest._retry = true; // Mark request to prevent infinite loops
      isRefreshing = true;

      try {
        const refreshData = {
          email: authStore.user.email,
          refreshToken: authStore.refreshToken,
        };
        
        console.log('Attempting token refresh...');
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await refreshTokenApiCall(refreshData);
        console.log('Token refresh successful!');

        // Update store and localStorage (setSession handles this)
        await authStore.setSession(newAccessToken, newRefreshToken);

        // Update header of the original request
        apiClient.defaults.headers.common['Authorization'] = 'Bearer ' + newAccessToken;
        originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;

        // Process queued requests with the new token
        processQueue(null, newAccessToken);
        
        // Retry the original request
        return apiClient(originalRequest);

      } catch (refreshError: any) {
        console.error('Token refresh failed:', refreshError?.response?.data || refreshError.message);
        processQueue(refreshError, null); // Reject queued requests
        authStore.logout(); // Logout user if refresh fails
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // For errors other than 401 or if refresh conditions aren't met, just reject
    console.error('API Error (Non-401 or no refresh possible):', error.response?.status, error.message);
    return Promise.reject(error);
  }
);

export default apiClient; 