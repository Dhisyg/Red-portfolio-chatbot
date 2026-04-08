// models/Contact.js
const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
  name:    { type: String, required: true, trim: true, maxlength: 100 },
  email:   { type: String, required: true, trim: true, lowercase: true },
  phone:   { type: String, trim: true, default: '' },
  service: { type: String, trim: true, default: '' },
  budget:  { type: String, trim: true, default: '' },
  message: { type: String, required: true, maxlength: 2000 },
  status:  { type: String, enum: ['new', 'read', 'replied'], default: 'new' },
}, { timestamps: true });

module.exports = mongoose.model('Contact', ContactSchema);
