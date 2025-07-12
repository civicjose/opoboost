// backend/controllers/testController.js
const TestDef = require('../models/TestDefinition');
const Question = require('../models/Question');
const Category = require('../models/Category');
const Attempt = require('../models/Attempt');

// --- HELPER ---
// Función interna para obtener o crear la categoría para simulacros.
async function getSimulacroCategory() {
  let category = await Category.findOne({ name: 'Simulacros Generales' });
  if (!category) {
    category = new Category({
      name: 'Simulacros Generales',
      description: 'Categoría para los tests aleatorios generados como simulacro.'
    });
    await category.save();
  }
  return category;
}

// --- CONTROLADORES ---

/**
 * Obtiene los tests de una categoría y los enriquece con las estadísticas del usuario.
 * Usado para la vista de tabla en TestList.
 */
exports.getTestsForCategoryWithUserStats = async (req, res) => {
    const { catId } = req.params;
    const  userId  = req.user.id; // Obtenemos el ID del usuario del token
  
    try {
      const tests = await TestDef.find({ category: catId }).lean();
      const testIds = tests.map(t => t._id);
      const userAttempts = await Attempt.find({ user: userId, testDef: { $in: testIds } });
  
      const testsWithStats = tests.map(test => {
        const attemptsForThisTest = userAttempts.filter(a => a.testDef.equals(test._id));
        const highestScore = attemptsForThisTest.reduce((max, attempt) => Math.max(max, attempt.score), 0);
        
        return {
          ...test,
          userAttemptsCount: attemptsForThisTest.length,
          highestScore: highestScore,
        };
      });
      
      const approvedTestsCount = testsWithStats.filter(t => t.highestScore >= 5).length;
      const totalTestsCount = tests.length;
      const categoryProgress = totalTestsCount > 0 ? (approvedTestsCount / totalTestsCount) * 100 : 0;
  
      res.json({
        tests: testsWithStats,
        progress: Math.round(categoryProgress)
      });
  
    } catch (err) {
      console.error("Error fetching tests with stats:", err.message);
      res.status(500).json({ message: "Error al cargar los datos de la categoría." });
    }
};


/**
 * Crea un TestDefinition con una selección aleatoria de preguntas.
 */
exports.createTest = async (req, res) => {
  const { limit = 10 } = req.body;
  try {
    const questions = await Question.aggregate([
      { $match: { validated: true } },
      { $sample: { size: Number(limit) } }
    ]);
    if (questions.length < limit) {
      return res.status(400).json({ message: `No se encontraron suficientes preguntas. Solo se pudieron obtener ${questions.length}.` });
    }
    const questionIds = questions.map(q => q._id);
    const simulacroCategory = await getSimulacroCategory();
    const newTestDef = new TestDef({
      title: `Simulacro Aleatorio (${limit} preguntas)`,
      category: simulacroCategory._id,
      questions: questionIds
    });
    await newTestDef.save();
    const fullTestDef = await TestDef.findById(newTestDef._id).populate('questions');
    res.status(201).json(fullTestDef);
  } catch (err) {
    console.error('Error al crear el simulacro:', err.message);
    res.status(500).json({ message: 'Error generando simulacro', error: err.message });
  }
};

/**
 * Crea un TestDefinition con preguntas que el usuario ha fallado previamente.
 */
exports.createFailedQuestionsTest = async (req, res) => {
    const { limit = 10 } = req.body;
    const userId = req.user.id;
    try {
        const attempts = await Attempt.find({ user: userId }).populate({
            path: 'testDef',
            populate: { path: 'questions' }
        });
        const failedQuestionsIds = new Set();
        attempts.forEach(attempt => {
            if (!attempt.testDef || !attempt.testDef.questions) return;
            attempt.answers.forEach(answer => {
                const question = attempt.testDef.questions.find(q => q && q._id.equals(answer.question));
                if (question && answer.answer !== question.correct) {
                    failedQuestionsIds.add(question._id.toString());
                }
            });
        });
        const uniqueFailedIds = Array.from(failedQuestionsIds);
        if (uniqueFailedIds.length < limit) {
            return res.status(400).json({ message: `No tienes suficientes preguntas falladas. Solo tienes ${uniqueFailedIds.length} y has solicitado ${limit}.` });
        }
        const randomFailedIds = uniqueFailedIds.sort(() => 0.5 - Math.random()).slice(0, limit);
        const simulacroCategory = await getSimulacroCategory();
        const newTestDef = new TestDef({
            title: `Repaso de Fallos (${limit} preguntas)`,
            category: simulacroCategory._id,
            questions: randomFailedIds
        });
        await newTestDef.save();
        const fullTestDef = await TestDef.findById(newTestDef._id).populate('questions');
        res.status(201).json(fullTestDef);
    } catch (err) {
        console.error('Error creando test de fallos:', err.message);
        res.status(500).json({ message: 'Error generando el test de repaso' });
    }
};

/**
 * Lista las definiciones de test de una categoría (versión simple).
 */
exports.listTestDefsByCat = async (req, res) => {
  const { catId } = req.params;
  const defs = await TestDef.find({ category: catId }).sort('title');
  res.json(defs);
};

/**
 * Obtiene una definición de test específica por su ID, populando las preguntas.
 */
exports.getTestDefinitionById = async (req, res) => {
  const { defId } = req.params;
  try {
    const td = await TestDef.findById(defId).populate('questions');
    if (!td) return res.status(404).json({ message: 'Test no encontrado' });
    res.json(td);
  } catch (err) {
    console.error('Error obteniendo test:', err.message);
    res.status(500).json({ message: 'Error obteniendo test', error: err.message });
  }
};

/**
 * Crea una nueva definición de test vacía para una categoría.
 */
exports.createTestDefinition = async (req, res) => {
  const { catId } = req.params;
  const { title } = req.body;
  if (!title) return res.status(400).json({ message: 'Título obligatorio' });
  const td = new TestDef({ category: catId, title, questions: [] });
  await td.save();
  res.status(201).json(td);
};

/**
 * Importa un array de preguntas (JSON) a una definición de test existente.
 */
exports.importQuestionsToTest = async (req, res) => {
  const { defId } = req.params;
  const arr = req.body;
  const docs = arr.map(q => ({
    text: q.text,
    options: q.options.map(o => ({ text: o })),
    correct: q.correct,
    topic: q.topic || 'General',
    topicTitle: q.topicTitle || 'General',
    validated: q.validated ?? false
  }));
  const inserted = await Question.insertMany(docs);
  const ids = inserted.map(d => d._id);
  const td = await TestDef.findById(defId);
  td.questions.push(...ids);
  await td.save();
  res.json({ addedCount: ids.length, totalQuestions: td.questions.length });
};

exports.updateTestDefinition = async (req, res) => {
  const { defId } = req.params;
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'El título es obligatorio.' });
  }

  try {
    const updatedTest = await TestDef.findByIdAndUpdate(
      defId,
      { title: title },
      { new: true } // Devuelve el documento actualizado
    );

    if (!updatedTest) {
      return res.status(404).json({ message: 'No se encontró el test para actualizar.' });
    }

    res.json(updatedTest);
  } catch (err) {
    console.error("Error actualizando el test:", err.message);
    res.status(500).json({ message: "Error interno al actualizar el test." });
  }
};

exports.deleteTestDefinition = async (req, res) => {
  const { defId } = req.params;

  try {
    // 1. Borrar todos los intentos que pertenecen a esta definición de test
    await Attempt.deleteMany({ testDef: defId });

    // 2. Borrar la definición del test en sí
    const deletedTest = await TestDef.findByIdAndDelete(defId);

    if (!deletedTest) {
      return res.status(404).json({ message: 'No se encontró el test para eliminar.' });
    }

    res.json({ message: 'Test y todos sus intentos asociados han sido eliminados.' });
  } catch (err) {
    console.error("Error en el borrado del test:", err.message);
    res.status(500).json({ message: "Error interno al eliminar el test." });
  }
};