const mongoose = require('mongoose');
const QuestionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  options: [{ text: String }],
  correct: { type: Number, required: true },
  topic: { type: String, required: true },       // ej. "Tema1"
  topicTitle: { type: String, required: true },  // ej. "Historia de España"
  validated: { type: Boolean, default: false }
});
module.exports = mongoose.model('Question', QuestionSchema);
