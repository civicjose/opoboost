import api from './auth';

// Listar definiciones de test por categoría
export const getTestDefsByCategory = catId =>
  api.get(`/tests/definitions/list/${encodeURIComponent(catId)}`);

// Obtener una definición de test con sus preguntas
export const getTestDefinitionById = defId =>
  api.get(`/tests/definitions/${encodeURIComponent(defId)}`);

// Crear nueva definición de test
export const createTestDefinition = (catId, title) =>
  api.post(`/tests/definitions/${encodeURIComponent(catId)}`, { title });

// Importar preguntas JSON a un test
export const importQuestionsToTest = (defId, questionsArray) =>
  api.post(
    `/tests/definitions/${encodeURIComponent(defId)}/import-questions`,
    questionsArray
  );

// Enviar un intento de test
export const submitTest = payload =>
  api.post('/attempts', payload);
