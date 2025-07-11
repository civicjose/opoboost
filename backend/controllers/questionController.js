// backend/controllers/questionController.js
const Question = require('../models/Question');

// Listar todas las preguntas
exports.listQuestions = async (req, res) => {
  try {
    const qs = await Question.find();
    res.json(qs);
  } catch (err) {
    res.status(500).json({ message: 'Error listando preguntas', error: err.message });
  }
};

// Obtener pregunta por ID
exports.getQuestionById = async (req, res) => {
  try {
    const q = await Question.findById(req.params.id);
    if (!q) return res.status(404).json({ message: 'Pregunta no encontrada' });
    res.json(q);
  } catch (err) {
    res.status(500).json({ message: 'Error obteniendo pregunta', error: err.message });
  }
};

// Crear una pregunta
exports.createQuestion = async (req, res) => {
  try {
    const { text, options, correct, topic, topicTitle, validated } = req.body;
    const opts = options.map(o => ({ text: o.text ?? o }));
    const q = new Question({ text, options: opts, correct, topic, topicTitle, validated });
    await q.save();
    res.status(201).json(q);
  } catch (err) {
    res.status(400).json({ message: 'Error creando pregunta', error: err.message });
  }
};

// Actualizar pregunta
exports.updateQuestion = async (req, res) => {
  try {
    const q = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!q) return res.status(404).json({ message: 'Pregunta no encontrada' });
    res.json(q);
  } catch (err) {
    res.status(400).json({ message: 'Error actualizando pregunta', error: err.message });
  }
};

// Eliminar pregunta
exports.deleteQuestion = async (req, res) => {
  try {
    await Question.findByIdAndDelete(req.params.id);
    res.json({ message: 'Pregunta eliminada' });
  } catch (err) {
    res.status(500).json({ message: 'Error borrando pregunta', error: err.message });
  }
};

// Importar preguntas en bloque
exports.importQuestions = async (req, res) => {
  const arr = req.body;
  if (!Array.isArray(arr) || arr.length === 0) {
    return res.status(400).json({ message: 'Array de preguntas vacío o inválido' });
  }
  try {
    const docs = arr.map(q => ({
      text: q.text,
      options: q.options.map(o => ({ text: o })),
      correct: q.correct,
      topic: q.topic,
      topicTitle: q.topicTitle,
      validated: q.validated ?? false
    }));
    const inserted = await Question.insertMany(docs);
    res.json({ insertedCount: inserted.length, message: 'Preguntas importadas correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error importando preguntas', error: err.message });
  }
};
