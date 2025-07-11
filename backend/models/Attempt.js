const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema({
  question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  answer:   { type: Number, required: true }
});

const AttemptSchema = new mongoose.Schema({
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  testDef:  { type: mongoose.Schema.Types.ObjectId, ref: 'TestDefinition', required: true },
  answers:  { type: [AnswerSchema], default: [] },
  aciertos: { type: Number, required: true },
  fallos:   { type: Number, required: true },
  vacias:   { type: Number, required: true },
  score:    { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Attempt', AttemptSchema);
