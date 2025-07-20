// frontend/src/api/auth.js
import axios from 'axios';

const api = axios.create({
  baseURL: '/api', 
  //baseURL: 'http://localhost:5000/api',
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.log("Sesión expirada o inválida. Cerrando sesión...");
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

const token = localStorage.getItem('token');
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export default api;