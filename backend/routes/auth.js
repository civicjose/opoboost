const router = require('express').Router();
const { register, login, validateUser, forgotPassword, resetPassword } = require('../controllers/authController');
const auth   = require('../middleware/authMiddleware');
const role   = require('../middleware/roleMiddleware');


// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// PUT /api/auth/validate/:id  → sólo ADMIN
router.put('/validate/:id', auth, role(['administrador']), validateUser);

// POST /api/auth/forgot-password
router.post('/forgot-password', forgotPassword);

// POST /api/auth/reset-password/:token
router.post('/reset-password/:token', resetPassword);

module.exports = router;
