import api from './auth';

// Topics
export const getTopics = () =>
  api.get('/questions/topics');

export const getQuestionsByTopic = topicId =>
  api.get(`/questions/topics/${encodeURIComponent(topicId)}`);

export const seedTopics = () =>
  api.post('/questions/seed');

export const deleteTopicApi = topicId =>
  api.delete(`/questions/topics/${encodeURIComponent(topicId)}`);

export const updateTopicTitle = (topicId, data) =>
  api.put(`/questions/topics/${encodeURIComponent(topicId)}`, data);

// Preguntas
export const createQuestion = question =>
  api.post('/questions', question);

export const updateQuestion = (questionId, data) =>
  api.put(`/questions/${encodeURIComponent(questionId)}`, data);

// Para ManageTopics.jsx
export const deleteQuestionApi = questionId =>
  api.delete(`/questions/${encodeURIComponent(questionId)}`);

// Para TestDetail.jsx
export const deleteQuestion = questionId =>
  api.delete(`/questions/${encodeURIComponent(questionId)}`);
