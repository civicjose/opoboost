// backend/controllers/attemptController.js
const Attempt = require('../models/Attempt');

// Guardar un nuevo intento de test
exports.submitAttempt = async (req, res) => {
  try {
    const { testDef, answers, aciertos, fallos, vacias, score, duration } = req.body;
    const attempt = new Attempt({
      user: req.user.id,
      testDef,
      answers,
      aciertos,
      fallos,
      vacias,
      score,
      duration
    });
    await attempt.save();
    res.status(201).json(attempt);
  } catch (err) {
    console.error('Error al guardar el intento:', err.message);
    res.status(500).json({ message: 'Error guardando intento', error: err.message });
  }
};

// Obtener todos los intentos del usuario logueado
exports.getUserAttempts = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 0; // 1. Lee el límite de la URL

    let query = Attempt.find({ user: req.user.id })
      .populate('testDef', 'title category')
      .sort({ createdAt: -1 });

    // 2. Si hay un límite, lo aplicamos
    if (limit > 0) {
      query = query.limit(limit);
    }

    const attempts = await query;
    res.json(attempts);
  } catch (err) {
    console.error('Error al obtener los intentos:', err.message);
    res.status(500).json({ message: 'Error obteniendo intentos', error: err.message });
  }
};

// Obtener un intento específico por su ID para la revisión
exports.getAttemptById = async (req, res) => {
  try {
    const attempt = await Attempt.findById(req.params.id)
      .populate({
        path: 'testDef',
        populate: {
          path: 'questions'
        }
      });

    if (!attempt) {
      return res.status(404).json({ message: 'Intento no encontrado.' });
    }

    // --- LÓGICA DE AUTORIZACIÓN CORREGIDA ---
    // El método .equals() de Mongoose compara correctamente los ObjectIds.
    // También añadimos la condición para permitir el acceso al administrador.
    if (!attempt.user.equals(req.user.id) && req.user.role !== 'administrador') {
      return res.status(403).json({ message: 'No tienes permiso para ver este intento.' });
    }

    // Si la comprobación pasa, devolvemos el intento.
    res.json(attempt);

  } catch (err) {
    console.error('Error al obtener el intento:', err.message);
    res.status(500).json({ message: 'Error en el servidor al obtener el intento' });
  }
};