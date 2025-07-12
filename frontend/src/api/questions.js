// frontend/src/api/questions.js
import api from './auth';

// Ya no necesitamos las funciones relacionadas con topics,
// así que las eliminamos, dejando solo las de preguntas individuales.

// Preguntas

export const getAllQuestions = () =>
  api.get('/questions');
export const createQuestion = question =>
  api.post('/questions', question);

export const updateQuestion = (questionId, data) =>
  api.put(`/questions/${encodeURIComponent(questionId)}`, data);

// Para ManageTopics.jsx (ahora obsoleto, pero lo dejamos por si se usa en otro sitio)
export const deleteQuestionApi = questionId =>
  api.delete(`/questions/${encodeURIComponent(questionId)}`);

// Para TestDetail.jsx
export const deleteQuestion = questionId =>
  api.delete(`/questions/${encodeURIComponent(questionId)}`);