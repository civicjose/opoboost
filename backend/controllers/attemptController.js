const Attempt = require('../models/Attempt');

exports.submitAttempt = async (req, res) => {
  try {
    const { testDef, answers, aciertos, fallos, vacias, score } = req.body;
    const attempt = new Attempt({
      user: req.user.id,
      testDef,
      answers,
      aciertos,
      fallos,
      vacias,
      score
    });
    await attempt.save();
    res.status(201).json(attempt);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error guardando intento', error: err.message });
  }
};

exports.getUserAttempts = async (req, res) => {
  try {
    const attempts = await Attempt
      .find({ user: req.user.id })
      .populate('testDef', 'title');
    res.json(attempts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error obteniendo intentos', error: err.message });
  }
};
