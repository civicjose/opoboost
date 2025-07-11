// backend/controllers/statsController.js
const Attempt = require('../models/Attempt');
const TestDef = require('../models/TestDefinition');

exports.getStats = async (req, res) => {
  const userId = req.user.id;

  try {
    // 1. Obtener todos los intentos del usuario
    const allAttempts = await Attempt.find({ user: userId }).sort({ createdAt: -1 });

    // 2. Filtrar para quedarse solo con el último intento de cada test único
    const latestAttempts = new Map();
    allAttempts.forEach(attempt => {
      const testId = attempt.testDef.toString();
      if (!latestAttempts.has(testId)) {
        latestAttempts.set(testId, attempt);
      }
    });

    const uniqueLatestAttempts = Array.from(latestAttempts.values());
    
    let correct = 0, incorrect = 0;
    uniqueLatestAttempts.forEach(attempt => {
        correct += attempt.aciertos;
        incorrect += attempt.fallos;
    });

    // 3. Contar total de tests (simulacros) y progreso
    const totalSimulacros = uniqueLatestAttempts.length;
    const totalDefinitions = await TestDef.countDocuments(); // Contamos todas las definiciones de test disponibles
    const progress = totalDefinitions > 0 
      ? Math.min(100, Math.round((totalSimulacros / totalDefinitions) * 100))
      : 0;

    res.json({
      totalTests: totalSimulacros,
      correct,
      incorrect,
      simulacros: totalSimulacros, // Lo mantenemos por consistencia de la UI
      progress
    });

  } catch (err) {
    console.error("Error calculating stats:", err);
    res.status(500).json({ message: 'Error calculando estadísticas', error: err.message });
  }
};