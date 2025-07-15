// backend/routes/questions.js
const router = require('express').Router();
const auth   = require('../middleware/authMiddleware');
const role   = require('../middleware/roleMiddleware');
const {
  listQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  importQuestions
} = require('../controllers/questionController');

const adminRoles = ['profesor', 'administrador'];

// GET  /api/questions           → Listar todas las preguntas para el panel
router.get('/',              auth, role(adminRoles), listQuestions);

// GET  /api/questions/:id       → Obtener una pregunta por ID
router.get('/:id',           auth, getQuestionById);

// POST /api/questions           → Crear una nueva pregunta
router.post('/',             auth, role(adminRoles), createQuestion);

// PUT  /api/questions/:id       → Actualizar una pregunta existente
router.put('/:id',           auth, role(adminRoles), updateQuestion);

// DELETE /api/questions/:id     → Eliminar una pregunta
router.delete('/:id',        auth, role(adminRoles), deleteQuestion);

// POST /api/questions/import    → Importar preguntas en bloque
router.post('/import',       auth, role(adminRoles), importQuestions);

module.exports = router;