const Attempt = require('../models/Attempt');

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

exports.getUserAttempts = async (req, res) => {
  try {
    const attempts = await Attempt
      .find({ user: req.user.id })
      .populate('testDef', 'title')
      .sort({ createdAt: -1 });
    res.json(attempts);
  } catch (err) {
    // CAMBIO: Hacemos el log más limpio y específico.
    console.error('Error al obtener los intentos:', err.message);
    res.status(500).json({ message: 'Error obteniendo intentos', error: err.message });
  }
};