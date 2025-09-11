import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Normalized error
    const message = error?.response?.data?.message || error.message || 'Request error';
    return Promise.reject(new Error(message));
  },
);

export default api;


