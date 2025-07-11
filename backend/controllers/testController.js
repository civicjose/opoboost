const TestDef = require('../models/TestDefinition');
const Question = require('../models/Question');
const Category = require('../models/Category');

// Helper para obtener o crear la categoría de simulacros
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

// Controlador para CREAR un test aleatorio (simulacro)
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
    // CAMBIO: Hacemos el log más limpio y específico.
    console.error('Error al crear el simulacro:', err.message);
    res.status(500).json({ message: 'Error generando simulacro', error: err.message });
  }
};

// --- OTROS CONTROLADORES ---

// Listar tests de una categoría
exports.listTestDefsByCat = async (req, res) => {
    try {
        const { catId } = req.params;
        const defs = await TestDef.find({ category: catId }).sort('title');
        res.json(defs);
    } catch (err) {
        console.error('Error listando tests por categoría:', err.message);
        res.status(500).json({ message: 'Error listando tests', error: err.message });
    }
};

// Obtener un test con preguntas
exports.getTestDefinitionById = async (req, res) => {
    try {
        const { defId } = req.params;
        const td = await TestDef.findById(defId).populate('questions');
        if (!td) return res.status(404).json({ message: 'No encontrado' });
        res.json(td);
    } catch (err) {
        console.error('Error obteniendo la definición del test:', err.message);
        res.status(500).json({ message: 'Error obteniendo test', error: err.message });
    }
};

// Crear un nuevo test
exports.createTestDefinition = async (req, res) => {
    try {
        const { catId } = req.params;
        const { title } = req.body;
        if (!title) return res.status(400).json({ message: 'Título obligatorio' });
        const td = new TestDef({ category: catId, title, questions: [] });
        await td.save();
        res.status(201).json(td);
    } catch(err) {
        console.error('Error creando la definición del test:', err.message);
        res.status(500).json({ message: 'Error creando test', error: err.message });
    }
};

// Importar preguntas a un test
exports.importQuestionsToTest = async (req, res) => {
    try {
        const { defId } = req.params;
        const arr = req.body;
        const docs = arr.map(q => ({
            text: q.text,
            options: q.options.map(o => ({ text: o })),
            correct: q.correct,
            topic: q.topic,
            topicTitle: q.topicTitle,
            validated: q.validated ?? false
        }));
        const inserted = await Question.insertMany(docs);
        const ids = inserted.map(d => d._id);
        const td = await TestDef.findById(defId);
        td.questions.push(...ids);
        await td.save();
        res.json({ addedCount: ids.length, totalQuestions: td.questions.length });
    } catch(err) {
        console.error('Error importando preguntas:', err.message);
        res.status(500).json({ message: 'Error importando preguntas', error: err.message });
    }
};