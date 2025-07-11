const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema({
  question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  answer:   { type: Number, required: true },
  correct:  { type: Boolean, required: true }
});

const TestSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true }],
  answers:   { type: [AnswerSchema], default: [] },
  score:     { type: Number, required: true },
  maxScore:  { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Test', TestSchema);
