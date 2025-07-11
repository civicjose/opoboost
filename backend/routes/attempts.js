const router = require('express').Router();
const auth   = require('../middleware/authMiddleware');
const { submitAttempt, getUserAttempts } = require('../controllers/attemptController');

router.post('/', auth, submitAttempt);
router.get('/', auth, getUserAttempts);

module.exports = router;
