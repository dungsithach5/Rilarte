import axios from 'axios';
import { store } from '../../app/context/store';
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
    return Promise.reject(error);
  }
);

export default API; 