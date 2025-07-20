// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt   = require('bcrypt');

const UserSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  email:      { type: String, required: true, unique: true, lowercase: true },
  password:   { type: String, required: true },
  role:       { type: String, enum: ['alumno','profesor','administrador'], default: 'alumno' },
  validated:  { type: Boolean, default: false },
  accessibleCategories: {
    type: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }],
    default: []
  },
  resetPasswordToken:   { type: String },
  resetPasswordExpires: { type: Date },
  createdAt:  { type: Date, default: Date.now }
});

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.checkPassword = function(pass) {
  return bcrypt.compare(pass, this.password);
};

module.exports = mongoose.model('User', UserSchema);