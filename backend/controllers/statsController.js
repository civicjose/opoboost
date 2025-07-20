// backend/controllers/statsController.js
const Attempt = require('../models/Attempt');
const TestDef = require('../models/TestDefinition');
const Category = require('../models/Category');

exports.getStats = async (req, res) => {
  const userId = req.user.id;

  try {
    // 1. Obtenemos todos los intentos, populando la referencia al test
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

    // --- ¡AQUÍ ESTÁ LA SOLUCIÓN! ---
    // 2. Filtramos los intentos para quedarnos solo con aquellos cuyo testDef todavía existe.
    // Si un test fue eliminado, attempt.testDef será `null` después del populate.
    const validAttempts = allAttempts.filter(attempt => attempt.testDef);

    // 3. Ahora, trabajamos solo con los intentos válidos
    const latestAttempts = new Map();
    validAttempts.forEach(attempt => {
      const testId = attempt.testDef._id.toString();
      if (!latestAttempts.has(testId)) {
        latestAttempts.set(testId, attempt);
      }
    });
    const uniqueLatestAttempts = Array.from(latestAttempts.values());

    // 4. Calculamos las estadísticas, que ahora serán correctas
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

    // (El resto de la lógica para el progreso no necesita cambios)
    const approvedTestsCount = uniqueLatestAttempts.filter(attempt => attempt.score >= 5).length;
    const generalCategory = await Category.findOne({ name: 'Simulacros Generales' });
    const totalAvailableTests = await TestDef.countDocuments({ 
        category: { $ne: generalCategory ? generalCategory._id : null },
        isTemporary: { $ne: true } // Excluimos también los simulacros temporales
    });
    const progress = totalAvailableTests > 0 
      ? Math.round((approvedTestsCount / totalAvailableTests) * 100)
      : 0;

    res.json({
      totalTests: totalTestsTaken,
      correct: correct,
      incorrect: incorrect,
      simulacros: simulacroCount,
      progress: Math.min(100, progress)
    });

  } catch (err) {
    console.error("Error calculando estadísticas:", err.message);
    res.status(500).json({ message: 'Error calculando estadísticas', error: err.message });
  }
};