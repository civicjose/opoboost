// frontend/src/api/auth.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', 
});

// --- INTERCEPTOR DE RESPUESTAS ---
// Esta función se ejecutará ANTES de que tu código reciba una respuesta de la API.
api.interceptors.response.use(
  // Si la respuesta es exitosa (código 2xx), simplemente la devuelve.
  (response) => response,
  
  // Si la respuesta es un error...
  (error) => {
    // Comprobamos si el error es un 401 (No Autorizado)
    if (error.response && error.response.status === 401) {
      console.log("Sesión expirada o inválida. Cerrando sesión...");
      
      // Limpiamos los datos de sesión del almacenamiento local
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Eliminamos el header de autorización para futuras peticiones
      delete api.defaults.headers.common['Authorization'];
      
      // Redirigimos al usuario a la página de login
      // Usamos window.location.href para forzar un refresco completo y limpiar el estado.
      window.location.href = '/login';
    }
    
    // Si es otro tipo de error, simplemente lo devolvemos para que sea manejado
    // por el código que hizo la llamada (el .catch).
    return Promise.reject(error);
  }
);


// Si hay un token en localStorage al cargar la app, lo ponemos en la cabecera por defecto
const token = localStorage.getItem('token');
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export default api;