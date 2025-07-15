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

// --- FUNCIÓN QUE FALTABA ---
// Actualizar una definición de test (ej. cambiar el título)
export const updateTestDefinition = (defId, data) =>
  api.put(`/tests/definitions/${encodeURIComponent(defId)}`, data);

// Importar preguntas JSON a un test
export const importQuestionsToTest = (defId, questionsArray) =>
  api.post(
    `/tests/definitions/${encodeURIComponent(defId)}/import-questions`,
    questionsArray
  );

// Enviar un intento de test
export const submitTest = payload =>
  api.post('/attempts', payload);

// Crear un test aleatorio (simulacro)
export const createTest = (limit = 10) =>
  api.post('/tests/random', { limit });

// Crear un test de repaso con preguntas falladas
export const createFailedQuestionsTest = (limit) =>
  api.post('/tests/failed', { limit });
  
// Obtener un intento de test por su ID para revisión
export const getAttemptById = attemptId => 
  api.get(`/attempts/${encodeURIComponent(attemptId)}`);

export const deleteTest = (defId) =>
  api.delete(`/tests/definitions/${encodeURIComponent(defId)}`);

export const addQuestionToTest = (defId, questionData) =>
  api.post(`/tests/definitions/${encodeURIComponent(defId)}/add-question`, questionData);