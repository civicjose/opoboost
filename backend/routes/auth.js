const router = require('express').Router();
const { register, login, validateUser } = require('../controllers/authController');
const auth   = require('../middleware/authMiddleware');
const role   = require('../middleware/roleMiddleware');

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// PUT /api/auth/validate/:id  → sólo ADMIN
router.put('/validate/:id', auth, role(['administrador']), validateUser);

module.exports = router;
