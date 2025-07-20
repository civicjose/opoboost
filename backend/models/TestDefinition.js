const mongoose = require('mongoose');

const TestDefinitionSchema = new mongoose.Schema({
  category:  { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  title:     { type: String, required: true },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question', default: [] }],
  isTemporary: { type: Boolean, default: false }, 
  userOwner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('TestDefinition', TestDefinitionSchema);
