// models/ChatLead.js
const mongoose = require('mongoose');

const ChatLeadSchema = new mongoose.Schema({
  name:     { type: String, trim: true },
  email:    { type: String, required: true, trim: true, lowercase: true },
  phone:    { type: String, trim: true },
  service:  { type: String, trim: true },
  budget:   { type: String, trim: true },
  platform: { type: String, trim: true },
  purpose:  { type: String, trim: true },
  details:  { type: String, trim: true },
  source:   { type: String, default: 'chatbot' },
  status:   { type: String, enum: ['new', 'contacted', 'converted'], default: 'new' },
}, { timestamps: true });

module.exports = mongoose.model('ChatLead', ChatLeadSchema);
