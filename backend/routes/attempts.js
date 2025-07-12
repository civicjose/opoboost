// backend/routes/attempts.js
const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const { 
    submitAttempt, 
    getUserAttempts, 
    getAttemptById 
} = require('../controllers/attemptController');

// --- RUTAS CORREGIDAS Y EXPLÍCITAS ---

// Ruta para crear un nuevo intento
// POST /api/attempts/
router.post('/', auth, submitAttempt);

// Ruta para obtener el historial de todos los intentos del usuario
// GET /api/attempts/history
router.get('/history', auth, getUserAttempts); // CAMBIO: De '/' a '/history'

// Ruta para obtener un intento específico por su ID.
// Ahora no hay ninguna ruta similar que pueda causar conflicto.
// GET /api/attempts/60c72b2f9b1d8c001f8e4d3b
router.get('/:id', auth, getAttemptById);

module.exports = router;