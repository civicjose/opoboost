// backend/routes/tests.js
const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const {
  listTestDefsByCat,
  getTestDefinitionById,
  createTestDefinition,
  importQuestionsToTest,
  createTest,
  createFailedQuestionsTest,
  updateTestDefinition,
  getTestsForCategoryWithUserStats,
  deleteTestDefinition 
} = require('../controllers/testController');

// --- NUEVA RUTA PARA LA VISTA DE TABLA ---
// GET /api/tests/category-stats/:catId -> Obtiene tests con estadísticas del usuario
router.get('/category-stats/:catId', auth, getTestsForCategoryWithUserStats);

// --- RUTAS EXISTENTES ---
router.get('/definitions/list/:catId', auth, listTestDefsByCat);
router.get('/definitions/:defId', auth, getTestDefinitionById);
router.post('/definitions/:catId', auth, role(['profesor', 'administrador']), createTestDefinition);
router.post('/definitions/:defId/import-questions', auth, role(['profesor', 'administrador']), importQuestionsToTest);
router.post('/random', auth, createTest);
router.post('/failed', auth, createFailedQuestionsTest);
router.put('/definitions/:defId', auth, role(['profesor', 'administrador']), updateTestDefinition);
router.delete('/definitions/:defId', auth, role(['administrador']), deleteTestDefinition);


module.exports = router;