const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  phone: { type: String, default: '' },
  isAdmin: { type: Boolean, default: false },
  street: { type: String, default: '' },
  apartment: { type: String, default: '' },
  city: { type: String, default: '' },
  zip: { type: String, default: '' },
  country: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
