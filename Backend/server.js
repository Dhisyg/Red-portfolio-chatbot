// ============================================================
// server.js — Rishi Portfolio Backend
// Express + MongoDB + Nodemailer
// ============================================================

require('dotenv').config();
const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
const rateLimit  = require('express-rate-limit');
const contactRoutes = require('./routes/contact');
const chatRoutes    = require('./routes/chat');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || '*',
  methods: ['GET', 'POST'],
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting — prevent spam
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 30,
  message: { success: false, message: 'Too many requests. Please try again later.' }
});
app.use('/api/', limiter);

// ── MongoDB ───────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB error:', err.message));

// ── Routes ────────────────────────────────────────────────────
app.use('/api/contact', contactRoutes);
app.use('/api/chat',    chatRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Keep-Alive Ping (for free hosting like Render) ────────────
// Prevents server from sleeping on free-tier hosting
if (process.env.KEEP_ALIVE_URL) {
  const https = require('https');
  setInterval(() => {
    https.get(process.env.KEEP_ALIVE_URL, (r) => {
      console.log(`🔄 Keep-alive ping: ${r.statusCode}`);
    }).on('error', err => console.warn('Keep-alive ping failed:', err.message));
  }, 14 * 60 * 1000); // every 14 minutes
}

// ── Global error handler ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
