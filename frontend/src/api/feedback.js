// frontend/src/api/feedback.js
import api from './auth';

// Enviar un nuevo feedback desde el formulario
export const submitFeedback = (feedbackData) => 
  api.post('/feedback', feedbackData);

// Obtener todos los feedbacks para el panel de admin
export const getFeedbacks = () => 
  api.get('/feedback');