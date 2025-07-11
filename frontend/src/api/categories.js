import api from './auth';

export const getCategories = () =>
  api.get('/categories');

export const getCategoryById = id =>
  api.get(`/categories/${encodeURIComponent(id)}`);

export const createCategory = data =>
  api.post('/categories', data);

export const updateCategory = (id, data) =>
  api.put(`/categories/${encodeURIComponent(id)}`, data);

export const deleteCategory = id =>
  api.delete(`/categories/${encodeURIComponent(id)}`);
