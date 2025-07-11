const TestDef  = require('../models/TestDefinition');
const Question = require('../models/Question');

// Listar tests de una categoría
exports.listTestDefsByCat = async (req, res) => {
  const { catId } = req.params;
  const defs = await TestDef.find({ category: catId }).sort('title');
  res.json(defs);
};

// Obtener un test con preguntas
exports.getTestDefinitionById = async (req, res) => {
  const { defId } = req.params;
  const td = await TestDef.findById(defId).populate('questions');
  if (!td) return res.status(404).json({ message: 'No encontrado' });
  res.json(td);
};

// Crear un nuevo test
exports.createTestDefinition = async (req, res) => {
  const { catId } = req.params;
  const { title } = req.body;
  if (!title) return res.status(400).json({ message: 'Título obligatorio' });
  const td = new TestDef({ category: catId, title, questions: [] });
  await td.save();
  res.status(201).json(td);
};

// Importar preguntas a un test
exports.importQuestionsToTest = async (req, res) => {
  const { defId } = req.params;
  const arr = req.body;
  const docs = arr.map(q => ({
    text:       q.text,
    options:    q.options.map(o => ({ text: o })),
    correct:    q.correct,
    topic:      q.topic,
    topicTitle: q.topicTitle,
    validated:  q.validated ?? false
  }));
  const inserted = await Question.insertMany(docs);
  const ids = inserted.map(d => d._id);
  const td = await TestDef.findById(defId);
  td.questions.push(...ids);
  await td.save();
  res.json({ addedCount: ids.length, totalQuestions: td.questions.length });
};

exports.getTestDefinitionById = async (req, res) => {
  const { defId } = req.params
  try {
    const td = await TestDef.findById(defId).populate('questions')
    if (!td) return res.status(404).json({ message: 'Test no encontrado' })
    res.json(td)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Error obteniendo test', error: err.message })
  }
}
