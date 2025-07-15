// backend/controllers/questionController.js
const Question = require('../models/Question');
const TestDefinition = require('../models/TestDefinition');

exports.listQuestions = async (req, res) => {
  try {
    const questions = await Question.find({}).sort({ createdAt: -1 }).lean();
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: 'Error listando preguntas', error: err.message });
  }
};

exports.getQuestionById = async (req, res) => {
  try {
    const q = await Question.findById(req.params.id);
    if (!q) return res.status(404).json({ message: 'Pregunta no encontrada' });
    res.json(q);
  } catch (err) {
    res.status(500).json({ message: 'Error obteniendo pregunta', error: err.message });
  }
};

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

exports.updateQuestion = async (req, res) => {
  try {
    const updatedQuestion = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedQuestion) {
      return res.status(404).json({ message: 'Pregunta no encontrada para actualizar' });
    }
    res.json(updatedQuestion);
  } catch (err) {
    res.status(400).json({ message: 'Error actualizando pregunta', error: err.message });
  }
};

exports.deleteQuestion = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedQuestion = await Question.findByIdAndDelete(id);
    if (!deletedQuestion) {
      return res.status(404).json({ message: "Pregunta no encontrada." });
    }
    await TestDefinition.updateMany(
      { questions: id },
      { $pull: { questions: id } }
    );
    res.json({ message: 'Pregunta eliminada permanentemente.' });
  } catch (err) {
    console.error("Error borrando la pregunta:", err.message);
    res.status(500).json({ message: 'Error borrando la pregunta.' });
  }
};

// --- FUNCIÓN CORREGIDA CON EL EXPORT ---
exports.importQuestions = async (req, res) => {
  const arr = req.body;
  if (!Array.isArray(arr) || arr.length === 0) {
    return res.status(400).json({ message: 'Array de preguntas vacío o inválido' });
  }
  try {
    const docs = arr.map(q => ({ text: q.text, options: q.options.map(o => ({ text: o })), correct: q.correct, topic: q.topic, topicTitle: q.topicTitle, validated: q.validated ?? false }));
    const inserted = await Question.insertMany(docs);
    res.json({ insertedCount: inserted.length, message: 'Preguntas importadas correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error importando preguntas', error: err.message });
  }
};