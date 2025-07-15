// backend/routes/feedback.js
const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const { submitFeedback, getFeedbacks } = require('../controllers/feedbackController');

// Cualquier usuario autenticado puede enviar feedback
router.post('/', auth, submitFeedback);

// Solo los administradores pueden ver todos los feedbacks
router.get('/', auth, role(['administrador']), getFeedbacks);

module.exports = router;