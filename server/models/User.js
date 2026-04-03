const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  school:    { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  name:      { type: String, required: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:  { type: String, required: true, select: false },
  role:      { type: String, enum: ['admin', 'teacher', 'student', 'peer', 'parent'], required: true },
  phone:     String,
  // Student-specific
  grade:     Number,
  section:   String,
  rollNo:    String,
  // Parent-specific
  childId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // Peer assignment
  peerId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive:  { type: Boolean, default: true }
}, { timestamps: true });

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
