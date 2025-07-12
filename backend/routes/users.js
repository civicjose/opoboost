// backend/routes/users.js
const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const {
  listActiveUsers,
  listPendingUsers,
  updateUserRole,
  deleteUser
} = require('../controllers/userController');

// GET /api/users/active -> Listar todos los usuarios validados (solo ADMIN)
router.get('/active', auth, role(['administrador']), listActiveUsers);

// GET /api/users/pending -> Listar todos los usuarios pendientes (solo ADMIN)
router.get('/pending', auth, role(['administrador']), listPendingUsers);

// PUT /api/users/:id -> Cambiar rol (solo ADMIN)
router.put('/:id', auth, role(['administrador']), updateUserRole);

// DELETE /api/users/:id -> Eliminar usuario (solo ADMIN)
router.delete('/:id', auth, role(['administrador']), deleteUser);

module.exports = router;