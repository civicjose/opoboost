const Test       = require('../models/Test');
const Simulacro = require('../models/Simulacro');

exports.getStats = async (req, res) => {
  const userId = req.user.id;
  // Tests
  const tests = await Test.find({ user: userId });
  const totalTests = tests.length;
  let correct = 0, incorrect = 0;
  tests.forEach(t => {
    t.answers.forEach(a => a.correct ? correct++ : incorrect++);
  });
  // Simulacros
  const totalSim = await Simulacro.countDocuments({ user: userId });
  // Progreso: porcentaje de tests hechos sobre 10 (máx 100%)
  const progress = Math.min(100, Math.round((totalTests / 10) * 100));

  res.json({ totalTests, correct, incorrect, simulacros: totalSim, progress });
};
