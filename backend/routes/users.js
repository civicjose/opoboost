// backend/routes/users.js
const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const {
  listActiveUsers,
  listPendingUsers,
  updateUserRole,
  deleteUser,
  getUserPermissions,
  updateUserPermissions,
  getMyPermissions
} = require('../controllers/userController');

// GET /api/users/active -> Listar todos los usuarios validados (solo ADMIN)
router.get('/active', auth, role(['administrador']), listActiveUsers);

// GET /api/users/pending -> Listar todos los usuarios pendientes (solo ADMIN)
router.get('/pending', auth, role(['administrador']), listPendingUsers);

// PUT /api/users/:id -> Cambiar rol (solo ADMIN)
router.put('/:id', auth, role(['administrador']), updateUserRole);

// DELETE /api/users/:id -> Eliminar usuario (solo ADMIN)
router.delete('/:id', auth, role(['administrador']), deleteUser);

// Obtener los permisos de un usuario
router.get('/:id/permissions', auth, role(['administrador']), getUserPermissions);

// Actualizar los permisos de un usuario
router.put('/:id/permissions', auth, role(['administrador']), updateUserPermissions);

router.get('/my-permissions', auth, getMyPermissions);

module.exports = router;