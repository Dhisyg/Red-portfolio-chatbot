// routes/contact.js
const express  = require('express');
const router   = express.Router();
const Contact  = require('../models/Contact');
const sendMail = require('../config/mailer');

// POST /api/contact
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, service, budget, message } = req.body;

    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email and message are required.' });
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email address.' });
    }

    // Save to MongoDB
    const contact = new Contact({ name, email, phone, service, budget, message });
    await contact.save();

    // Send email notification
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0f0f0f;color:#ffffff;border-radius:12px;overflow:hidden">
        <div style="background:linear-gradient(135deg,#FF3B3B,#FF6B6B);padding:28px 32px">
          <h2 style="margin:0;font-size:22px">📩 New Contact Form Submission</h2>
          <p style="margin:6px 0 0;opacity:.8;font-size:14px">Portfolio Website — rishuchaudhuri11@gmail.com</p>
        </div>
        <div style="padding:32px">
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:10px 0;color:#888;font-size:13px;width:130px">Name</td><td style="padding:10px 0;font-weight:600">${name}</td></tr>
            <tr><td style="padding:10px 0;color:#888;font-size:13px">Email</td><td style="padding:10px 0"><a href="mailto:${email}" style="color:#FF6B6B">${email}</a></td></tr>
            <tr><td style="padding:10px 0;color:#888;font-size:13px">Phone</td><td style="padding:10px 0">${phone || 'Not provided'}</td></tr>
            <tr><td style="padding:10px 0;color:#888;font-size:13px">Service</td><td style="padding:10px 0">${service || 'Not specified'}</td></tr>
            <tr><td style="padding:10px 0;color:#888;font-size:13px">Budget</td><td style="padding:10px 0">${budget || 'Not specified'}</td></tr>
          </table>
          <div style="background:#1a1a1a;border-radius:8px;padding:20px;margin-top:20px">
            <p style="color:#888;font-size:13px;margin:0 0 8px">Message</p>
            <p style="margin:0;line-height:1.7">${message.replace(/\n/g, '<br>')}</p>
          </div>
          <p style="color:#555;font-size:12px;margin-top:24px">Received: ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `;

    await sendMail({
      to: process.env.EMAIL_TO || 'rishuchaudhuri11@gmail.com',
      subject: `🚀 New Lead: ${name} — ${service || 'Portfolio Enquiry'}`,
      html,
    });

    // Send confirmation to user
    const confirmHtml = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0f0f0f;color:#ffffff;border-radius:12px;overflow:hidden">
        <div style="background:linear-gradient(135deg,#FF3B3B,#FF6B6B);padding:28px 32px">
          <h2 style="margin:0;font-size:22px">✅ Message Received!</h2>
        </div>
        <div style="padding:32px">
          <p>Hey <strong>${name}</strong>,</p>
          <p style="color:#888;line-height:1.7">Thanks for reaching out! I've received your message and will get back to you within <strong style="color:#fff">24 hours</strong>.</p>
          <p style="color:#888;line-height:1.7">In the meantime, feel free to check out my <a href="https://github.com/Dhisyg" style="color:#FF6B6B">GitHub</a> or connect on <a href="https://instagram.com/plutoplant_" style="color:#FF6B6B">Instagram</a>.</p>
          <p style="margin-top:32px">— Rishi 👋</p>
        </div>
      </div>
    `;
    await sendMail({ to: email, subject: '✅ Got your message — Rishi', html: confirmHtml });

    res.json({ success: true, message: 'Your message has been sent! I\'ll contact you soon.' });

  } catch (err) {
    console.error('Contact route error:', err);
    res.status(500).json({ success: false, message: 'Something went wrong. Please email directly at rishuchaudhuri11@gmail.com' });
  }
});

// GET /api/contact — list all leads (protected by simple token)
router.get('/', async (req, res) => {
  if (req.headers['x-admin-token'] !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  const leads = await Contact.find().sort({ createdAt: -1 }).limit(100);
  res.json({ success: true, data: leads });
});

module.exports = router;
