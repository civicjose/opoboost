// backend/models/Simulacro.js
const mongoose = require('mongoose');

// Definimos el esquema de cada respuesta
const AnswerSchema = new mongoose.Schema({
  question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  answer:   { type: Number, required: true },
  correct:  { type: Boolean, required: true }
});

// Esquema de un simulacro
const SimulacroSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true }],
  answers:   { type: [AnswerSchema], default: [] },
  score:     { type: Number, required: true },
  maxScore:  { type: Number, required: true },
  duration:  { type: Number, required: true }, // duración en minutos
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Simulacro', SimulacroSchema);
