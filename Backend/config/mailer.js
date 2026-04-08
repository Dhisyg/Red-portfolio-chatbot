// config/mailer.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,   // Gmail App Password (16 chars)
  },
});

/**
 * sendMail({ to, subject, html })
 */
async function sendMail({ to, subject, html, text }) {
  const mailOptions = {
    from: `"Rishi Portfolio" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]+>/g, ''),
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`📧 Email sent to ${to}: ${info.messageId}`);
  return info;
}

module.exports = sendMail;
