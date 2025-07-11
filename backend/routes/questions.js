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

// GET  /api/questions           → Listar todas
router.get('/',              auth, listQuestions);

// GET  /api/questions/:id       → Obtener por ID
router.get('/:id',           auth, getQuestionById);

// POST /api/questions           → Crear
router.post('/',             auth, role(['profesor','administrador']), createQuestion);

// PUT  /api/questions/:id       → Actualizar
router.put('/:id',           auth, role(['profesor','administrador']), updateQuestion);

// DELETE /api/questions/:id     → Eliminar
router.delete('/:id',        auth, role(['profesor','administrador']), deleteQuestion);

// POST /api/questions/import    → Importar en bloque
router.post('/import',       auth, role(['profesor','administrador']), importQuestions);

module.exports = router;
