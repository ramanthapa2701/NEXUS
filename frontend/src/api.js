import axios from 'axios';

// Instantiate Axios targeting your computer's specific network node address
const API = axios.create({
  baseURL: 'http://192.168.1.17:5000/api',
  timeout: 10000, // Safe connection threshold window
});

// Outbound Requests Interceptor for Persistent Token Evaluation
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('nexus_user_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;