// backend/controllers/statsController.js
const Attempt = require('../models/Attempt');
const TestDef = require('../models/TestDefinition'); // Importamos TestDefinition
const Category = require('../models/Category');

exports.getStats = async (req, res) => {
  const userId = req.user.id;

  try {
    // 1. Obtenemos todos los intentos del usuario
    const allAttempts = await Attempt.find({ user: userId })
      .populate({
        path: 'testDef',
        select: 'title category',
        populate: {
          path: 'category',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 });

    // 2. Filtramos para quedarnos solo con el último intento de cada test
    const latestAttempts = new Map();
    allAttempts.forEach(attempt => {
      if (attempt.testDef) { // Asegurarnos de que el testDef existe
        const testId = attempt.testDef._id.toString();
        if (!latestAttempts.has(testId)) {
          latestAttempts.set(testId, attempt);
        }
      }
    });
    const uniqueLatestAttempts = Array.from(latestAttempts.values());

    // 3. Calculamos las estadísticas básicas (aciertos, fallos, etc.)
    let correct = 0;
    let incorrect = 0;
    let simulacroCount = 0;
    
    uniqueLatestAttempts.forEach(attempt => {
        correct += attempt.aciertos;
        incorrect += attempt.fallos;
        if (attempt.testDef.category && attempt.testDef.category.name === 'Simulacros Generales') {
            simulacroCount++;
        }
    });
    const totalTestsTaken = uniqueLatestAttempts.length;

    // --- LÓGICA DE PROGRESO CORREGIDA ---
    // 4. Calculamos el progreso basado en tests APROBADOS sobre el TOTAL de tests
    
    // Contamos cuántos de los tests únicos realizados están aprobados
    const approvedTestsCount = uniqueLatestAttempts.filter(attempt => attempt.score >= 5).length;
    
    // Contamos el total de tests que existen en la plataforma (excluyendo los simulacros)
    const generalCategory = await Category.findOne({ name: 'Simulacros Generales' });
    const totalAvailableTests = await TestDef.countDocuments({ 
        category: { $ne: generalCategory ? generalCategory._id : null } 
    });

    // Calculamos el porcentaje
    const progress = totalAvailableTests > 0 
      ? Math.round((approvedTestsCount / totalAvailableTests) * 100)
      : 0;

    res.json({
      totalTests: totalTestsTaken,
      correct: correct,
      incorrect: incorrect,
      simulacros: simulacroCount,
      progress: Math.min(100, progress) // Aseguramos que no pase de 100
    });

  } catch (err) {
    console.error("Error calculando estadísticas:", err.message);
    res.status(500).json({ message: 'Error calculando estadísticas', error: err.message });
  }
};