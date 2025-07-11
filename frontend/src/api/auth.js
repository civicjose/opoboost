import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', 
});

// Si hay token en localStorage, lo ponemos en el header
const token = localStorage.getItem('token');
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export default api;
