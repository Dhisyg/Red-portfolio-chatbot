// routes/chat.js
// Optional backend chatbot API — handles chat submissions & lead saves
const express  = require('express');
const router   = express.Router();
const ChatLead = require('../models/ChatLead');
const sendMail = require('../config/mailer');

// POST /api/chat/lead — save chatbot-collected lead
router.post('/lead', async (req, res) => {
  try {
    const { name, email, phone, service, budget, details, platform, purpose } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const lead = new ChatLead({ name, email, phone, service, budget, details, platform, purpose });
    await lead.save();

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0f0f0f;color:#ffffff;border-radius:12px;overflow:hidden">
        <div style="background:linear-gradient(135deg,#FF3B3B,#FF6B6B);padding:28px 32px">
          <h2 style="margin:0">🤖 New Chatbot Lead</h2>
          <p style="opacity:.8;font-size:14px;margin:4px 0 0">Collected via AI Assistant</p>
        </div>
        <div style="padding:32px">
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px 0;color:#888;width:130px;font-size:13px">Name</td><td style="padding:8px 0;font-weight:600">${name || 'Unknown'}</td></tr>
            <tr><td style="padding:8px 0;color:#888;font-size:13px">Email</td><td style="padding:8px 0"><a href="mailto:${email}" style="color:#FF6B6B">${email}</a></td></tr>
            <tr><td style="padding:8px 0;color:#888;font-size:13px">Phone</td><td style="padding:8px 0">${phone || 'N/A'}</td></tr>
            <tr><td style="padding:8px 0;color:#888;font-size:13px">Service</td><td style="padding:8px 0">${service || 'N/A'}</td></tr>
            <tr><td style="padding:8px 0;color:#888;font-size:13px">Budget</td><td style="padding:8px 0">${budget || 'N/A'}</td></tr>
            <tr><td style="padding:8px 0;color:#888;font-size:13px">Platform</td><td style="padding:8px 0">${platform || 'N/A'}</td></tr>
            <tr><td style="padding:8px 0;color:#888;font-size:13px">Purpose</td><td style="padding:8px 0">${purpose || 'N/A'}</td></tr>
          </table>
          ${details ? `<div style="background:#1a1a1a;border-radius:8px;padding:20px;margin-top:16px"><p style="color:#888;font-size:13px;margin:0 0 8px">Project Details</p><p style="margin:0;line-height:1.7">${details}</p></div>` : ''}
          <p style="color:#555;font-size:12px;margin-top:20px">Received: ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `;

    await sendMail({
      to: process.env.EMAIL_TO || 'rishuchaudhuri11@gmail.com',
      subject: `🤖 Chatbot Lead: ${name || email} — ${service || 'Enquiry'}`,
      html,
    });

    res.json({ success: true, message: 'Lead saved successfully.' });

  } catch (err) {
    console.error('Chat lead error:', err);
    res.status(500).json({ success: false, message: 'Error saving lead.' });
  }
});

// GET /api/chat/leads — admin view
router.get('/leads', async (req, res) => {
  if (req.headers['x-admin-token'] !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  const leads = await ChatLead.find().sort({ createdAt: -1 }).limit(100);
  res.json({ success: true, data: leads });
});

module.exports = router;
