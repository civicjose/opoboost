// backend/routes/users.js
const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const {
  listUsers,
  updateUserRole,
  deleteUser
} = require('../controllers/userController');

// GET    /api/users        → listar todos (solo ADMIN)
router.get('/', auth, role(['administrador']), listUsers);

// PUT    /api/users/:id    → cambiar rol (solo ADMIN)
router.put('/:id', auth, role(['administrador']), updateUserRole);

// DELETE /api/users/:id    → eliminar usuario (solo ADMIN)
router.delete('/:id', auth, role(['administrador']), deleteUser);

module.exports = router;
