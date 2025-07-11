const router = require('express').Router();
const auth   = require('../middleware/authMiddleware');
const role   = require('../middleware/roleMiddleware');
const {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryById
} = require('../controllers/categoryController');

// Cualquiera autenticado ve categorías
router.get('/', auth, listCategories);
router.get('/:id', auth, getCategoryById);


// Solo profesor/admin CRUD
router.post('/',      auth, role(['profesor','administrador']), createCategory);
router.put('/:id',    auth, role(['profesor','administrador']), updateCategory);
router.delete('/:id', auth, role(['profesor','administrador']), deleteCategory);

module.exports = router;
