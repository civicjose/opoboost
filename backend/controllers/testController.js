// backend/controllers/testController.js
const TestDef = require('../models/TestDefinition');
const Question = require('../models/Question');
const Category = require('../models/Category');
const Attempt = require('../models/Attempt');
const TestDefinition = require('../models/TestDefinition');

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
    const td = await TestDefinition.findById(defId).populate('questions');
    if (!td) {
      return res.status(404).json({ message: 'Test no encontrado' });
    }

    // --- CORRECCIÓN CLAVE ---
    // Filtramos cualquier posible pregunta 'null' que pueda quedar si
    // una referencia no se ha borrado correctamente o por una condición de carrera.
    // Esto hace que la función sea mucho más resiliente.
    td.questions = td.questions.filter(q => q !== null);

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
    // 1. Primero, encontramos el test para saber qué preguntas contiene
    const testToDelete = await TestDef.findById(defId);
    if (!testToDelete) {
      return res.status(404).json({ message: 'Test no encontrado.' });
    }
    const questionIdsToCheck = testToDelete.questions;

    // 2. Borramos el TestDefinition y todos los intentos asociados
    await Attempt.deleteMany({ testDef: defId });
    await TestDef.findByIdAndDelete(defId);

    // 3. Ahora, revisamos cada pregunta que contenía el test borrado
    for (const questionId of questionIdsToCheck) {
      // Buscamos si algún OTRO test todavía contiene esta pregunta
      const otherTestsUsingQuestion = await TestDef.findOne({ questions: questionId });

      // Si no se encuentra ningún otro test (es decir, la pregunta está huérfana)...
      if (!otherTestsUsingQuestion) {
        // ...la borramos de la colección de Preguntas.
        await Question.findByIdAndDelete(questionId);
      }
    }

    res.json({ message: 'Test, intentos y preguntas huérfanas eliminados correctamente.' });

  } catch (err) {
    console.error("Error en el borrado del test y sus preguntas:", err.message);
    res.status(500).json({ message: "Error interno al eliminar el test." });
  }
};

exports.addQuestionToTest = async (req, res) => {
  const { defId } = req.params;
  const { text, options, correct } = req.body;

  if (!text || !options || correct === undefined) {
    return res.status(400).json({ message: 'Datos de la pregunta incompletos.' });
  }

  try {
    // 1. Buscamos el test al que vamos a añadir la pregunta
    const testDef = await TestDefinition.findById(defId);
    if (!testDef) {
      return res.status(404).json({ message: 'Test no encontrado.' });
    }

    // 2. Creamos la nueva pregunta en la base de datos
    const newQuestion = new Question({
      text,
      options: options.map(o => ({ text: o.text })), // Aseguramos el formato correcto
      correct,
      // Asignamos un topic genérico, ya que no se usa en la interfaz
      topic: testDef.category.toString(),
      topicTitle: 'Pregunta de Test',
      validated: true
    });
    await newQuestion.save();

    // 3. Añadimos el ID de la nueva pregunta al array de preguntas del test
    testDef.questions.push(newQuestion._id);
    await testDef.save();

    res.status(201).json(newQuestion);

  } catch (err) {
    console.error("Error añadiendo pregunta al test:", err.message);
    res.status(500).json({ message: "Error interno al añadir la pregunta." });
  }
};
