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
      const tests = await TestDef.find({ category: catId, isTemporary: { $ne: true } }).lean();
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
 * Crea un TestDefinition con preguntas que el usuario ha fallado previamente.
 */
exports.createFailedQuestionsTest = async (req, res) => {
    const { limit = 1000 } = req.body;
    const userId = req.user.id;
    try {
        // 1. Obtenemos TODOS los intentos del usuario, populando la referencia al test
        const allAttempts = await Attempt.find({ user: userId }).populate('testDef');

        // 2. Filtramos para descartar los intentos de tests que ya no existen (huérfanos)
        const validAttempts = allAttempts.filter(attempt => attempt.testDef);

        const failedQuestionsIds = new Set();
        
        // 3. Recorremos SOLO los intentos válidos
        validAttempts.forEach(attempt => {
            attempt.answers.forEach(answer => {
                // 4. Hacemos una comprobación ESTRICTA.
                // Solo se cuenta como fallo si el campo `isCorrect` existe y es explícitamente `false`.
                // Esto ignora de forma segura los intentos antiguos que no tienen este campo.
                if (answer.isCorrect === false) {
                    failedQuestionsIds.add(answer.question.toString());
                }
            });
        });

        const uniqueFailedIds = Array.from(failedQuestionsIds);

        if (uniqueFailedIds.length === 0) {
            return res.status(400).json({ message: '¡Felicidades! No tienes preguntas falladas para repasar.' });
        }

        // Barajamos y aplicamos el límite
        const randomFailedIds = uniqueFailedIds.sort(() => 0.5 - Math.random()).slice(0, limit);
        
        const simulacroCategory = await getSimulacroCategory();
        const newTestDef = new TestDef({
            title: `Repaso de ${randomFailedIds.length} Preguntas Falladas`,
            category: simulacroCategory._id,
            questions: randomFailedIds,
            isTemporary: true,
            userOwner: userId
        });
        await newTestDef.save();
        
        res.status(201).json(newTestDef);
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
    const testToDelete = await TestDef.findById(defId);
    if (!testToDelete) {
      return res.status(404).json({ message: 'Test no encontrado.' });
    }
    const questionIdsToCheck = testToDelete.questions;

    await Attempt.deleteMany({ testDef: defId });

    await TestDef.findByIdAndDelete(defId);

    for (const questionId of questionIdsToCheck) {
      const otherTestsUsingQuestion = await TestDef.findOne({ questions: questionId });
      if (!otherTestsUsingQuestion) {
        await Question.findByIdAndDelete(questionId);
      }
    }

    res.json({ message: 'Test, intentos y preguntas huérfanas eliminados correctamente.' });

  } catch (err) {
    console.error("Error en el borrado del test y sus dependencias:", err.message);
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

exports.createCustomSimulacro = async (req, res) => {
    const { testIds, limit, title, mode } = req.body;
    const userId = req.user.id;
    try {
        let questionPoolIds = new Set();
        let finalQuestionIds = [];

        if (mode === 'study') {
            if (!testIds || testIds.length === 0) return res.status(400).json({ message: 'Debes seleccionar al menos un test.' });
            const tests = await TestDef.find({ '_id': { $in: testIds }, isTemporary: { $ne: true } }).select('questions');
            tests.forEach(test => test.questions.forEach(qId => questionPoolIds.add(qId.toString())));
            finalQuestionIds = Array.from(questionPoolIds);
        } else if (mode === 'real') {
            const user = await User.findById(userId).select('accessibleCategories');
            const tests = await TestDef.find({ 'category': { $in: user.accessibleCategories }, isTemporary: { $ne: true } }).select('questions');
            tests.forEach(test => test.questions.forEach(qId => questionPoolIds.add(qId.toString())));
            const allAvailableIds = Array.from(questionPoolIds);
            if (limit > allAvailableIds.length) return res.status(400).json({ message: `Solo hay ${allAvailableIds.length} preguntas disponibles.` });
            finalQuestionIds = allAvailableIds.sort(() => 0.5 - Math.random()).slice(0, limit);
        }

        if (finalQuestionIds.length === 0) return res.status(400).json({ message: 'No se encontraron preguntas.' });
        finalQuestionIds.sort(() => 0.5 - Math.random());
        const simulacroCategory = await getSimulacroCategory();
        const newTestDef = new TestDef({ title, category: simulacroCategory._id, questions: finalQuestionIds, isTemporary: true, userOwner: userId });
        await newTestDef.save();
        res.status(201).json(newTestDef);
    } catch (err) {
        res.status(500).json({ message: 'Error generando el simulacro' });
    }
};
exports.createFailedQuestionsSimulacro = async (req, res) => {
    const userId = req.user.id;
    try {
        const allAttempts = await Attempt.find({ user: userId }).populate('testDef', '_id'); // Populamos solo el ID para validar existencia
        const validAttempts = allAttempts.filter(attempt => attempt.testDef);
        const failedQuestionsIds = new Set();
        
        validAttempts.forEach(attempt => {
            attempt.answers.forEach(answer => {
                if (answer.isCorrect === false) {
                    failedQuestionsIds.add(answer.question.toString());
                }
            });
        });

        const uniqueFailedIds = Array.from(failedQuestionsIds);
        if (uniqueFailedIds.length === 0) {
            return res.status(400).json({ message: '¡Felicidades! No tienes preguntas falladas para repasar.' });
        }
        uniqueFailedIds.sort(() => 0.5 - Math.random());

        const simulacroCategory = await getSimulacroCategory();
        const newTestDef = new TestDef({
            title: `Repaso de ${uniqueFailedIds.length} Preguntas Falladas`,
            category: simulacroCategory._id,
            questions: uniqueFailedIds,
            isTemporary: true,
            userOwner: userId
        });
        await newTestDef.save();
        res.status(201).json(newTestDef);
    } catch (err) {
        res.status(500).json({ message: 'Error generando el simulacro de repaso' });
    }
};