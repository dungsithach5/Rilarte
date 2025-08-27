import axios from 'axios';
import { store } from '../../context/store';
import Cookies from 'js-cookie';

const API = axios.create({
  baseURL: 'http://localhost:5001/api',
  timeout: 3000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
API.interceptors.request.use(
  (config) => {
    // Get token from multiple sources: Redux store, cookies, localStorage, sessionStorage
    const reduxState = store.getState();
    const reduxToken = reduxState.user?.token;
    const cookieToken = Cookies.get('token');
    const localToken = localStorage.getItem('token');
    const sessionToken = sessionStorage.getItem('token');
    
    // Use the first available token
    const token = reduxToken || cookieToken || localToken || sessionToken;
    
    console.log('🔑 API Request - Token sources:', {
      redux: !!reduxToken,
      cookie: !!cookieToken,
      local: !!localToken,
      session: !!sessionToken,
      final: !!token
    }, 'URL:', config.url);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log('⚠️ No token found for API request to:', config.url);
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
API.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    // Log basic error information safely
    try {
      console.error('API Error:', {
        message: error?.message || 'Unknown error',
        status: error?.response?.status || 'No status',
        url: error?.config?.url || 'No URL',
        method: error?.config?.method || 'No method'
      });
    } catch (logError) {
      // Fallback logging if the above fails
      console.error('API Error (fallback):', error?.message || 'Unknown error');
    }
    
    // Provide better error messages
    if (error?.code === 'ECONNABORTED') {
      error.message = 'Request timeout - Server không phản hồi trong thời gian quy định';
    } else if (error?.code === 'ERR_NETWORK') {
      error.message = 'Lỗi kết nối mạng - Không thể kết nối đến server';
    } else if (error?.response?.status === 404) {
      error.message = 'API endpoint không tồn tại';
    } else if (error?.response?.status >= 500) {
      error.message = 'Lỗi server - Vui lòng thử lại sau';
    }
    
    return Promise.reject(error);
  }
);

export default API;
