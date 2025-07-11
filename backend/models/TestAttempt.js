// backend/models/TestAttempt.js
const mongoose = require('mongoose');
const AttemptSchema = new mongoose.Schema({
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  testDef:  { type: mongoose.Schema.Types.ObjectId, ref: 'TestDefinition', required: true },
  answers:  [{ question: String, answer: Number }],
  aciertos: Number,
  fallos:   Number,
  vacias:   Number,
  score:    Number,
  createdAt:{ type: Date, default: Date.now }
});
module.exports = mongoose.model('Attempt', AttemptSchema);
