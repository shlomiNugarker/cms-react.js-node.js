import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3030';

// Configure axios defaults
axios.defaults.baseURL = BASE_URL;
axios.defaults.withCredentials = true;

// Add a request interceptor
axios.interceptors.request.use(
  (config) => {
    // No need to manually add the token anymore as it will be sent via cookies
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axios; 