// backend/models/Feedback.js
const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['sugerencia', 'bug'],
    required: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  page: {
    type: String, 
    required: true
  },
  replied: {
    type: Boolean,
    default: false
  },
  replyText: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Feedback', FeedbackSchema);