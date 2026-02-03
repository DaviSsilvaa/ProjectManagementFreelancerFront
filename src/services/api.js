import axios from 'axios';

// Define a URL base da sua API
const API_URL = 'http://localhost:3001/api/v1';

const api = axios.create({
  baseURL: API_URL,
});

// "Interceptor": Esta função é executada ANTES de cada requisição
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


export default api;