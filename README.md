# 🚀 Rishi Portfolio — Complete Setup Guide

## 📁 Folder Structure

```
Portfolio/
├── Frontend/
│   ├── index.html        ← Home page
│   ├── services.html     ← Services + Pricing
│   ├── projects.html     ← All projects
│   ├── about.html        ← About + Skills
│   ├── contact.html      ← Contact form
│   ├── style.css         ← All styles
│   └── script.js         ← JS + AI Chatbot engine
│
└── Backend/
    ├── server.js         ← Express app entry
    ├── package.json
    ├── .env.example      ← Copy to .env and fill in
    ├── routes/
    │   ├── contact.js    ← POST /api/contact
    │   └── chat.js       ← POST /api/chat/lead
    ├── models/
    │   ├── Contact.js    ← Contact form schema
    │   └── ChatLead.js   ← Chatbot lead schema
    └── config/
        └── mailer.js     ← Nodemailer Gmail setup
```

---

## ⚡ QUICK START

### FRONTEND — Deploy to Vercel (Recommended)

1. **Push the Frontend folder to a GitHub repo**
2. **Go to [vercel.com](https://vercel.com) → New Project → Import your repo**
3. **No build config needed** — Vercel serves static HTML directly
4. Your site goes live at `https://your-name.vercel.app`

**OR** just open `index.html` directly in a browser for local testing.

---

### BACKEND — Local Development

```bash
# 1. Navigate to Backend folder
cd Backend

# 2. Install dependencies
npm install

# 3. Create your .env file
cp .env.example .env
# Then edit .env with your real values

# 4. Start dev server
npm run dev
# Server runs at http://localhost:5000
```

---

## 🔧 CONFIGURATION

### 1. MongoDB (Free)
1. Create free account at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Create a **free M0 cluster**
3. Add a database user (username + password)
4. Whitelist IP: `0.0.0.0/0` (allow all) for development
5. Click **Connect → Drivers** → copy the connection string
6. Paste it into `.env` as `MONGO_URI`

Example:
```
MONGO_URI=mongodb+srv://rishi:mypassword@cluster0.abc123.mongodb.net/portfolio?retryWrites=true&w=majority
```

---

### 2. Gmail SMTP (Nodemailer)
1. Go to **[myaccount.google.com](https://myaccount.google.com)**
2. Security → **Enable 2-Step Verification**
3. Search for **"App passwords"**
4. Select app: **Mail**, device: **Other** → type "Portfolio"
5. Copy the **16-character app password** (e.g. `abcd efgh ijkl mnop`)
6. Add to `.env`:
```
EMAIL_USER=rishuchaudhuri11@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
```

---

### 3. EmailJS (Frontend — Contact Form & Chatbot)
The frontend contact form and chatbot use EmailJS to send emails **directly from the browser** (no backend needed for basic sending).

1. Sign up free at [emailjs.com](https://www.emailjs.com/)
2. **Add Email Service** → Gmail → Connect `rishuchaudhuri11@gmail.com`
3. **Create Email Template** with these variables:
   ```
   From: {{from_name}} <{{from_email}}>
   Subject: New Lead: {{from_name}}
   Body:
     Name: {{from_name}}
     Email: {{from_email}}
     Phone: {{phone}}
     Service: {{service}}
     Budget: {{budget}}
     Message: {{message}}
   ```
4. **Get your Public Key** from Account → API Keys
5. Open `contact.html` and `script.js`, replace:
   - `YOUR_PUBLIC_KEY` → your EmailJS public key
   - `YOUR_SERVICE_ID` → your Gmail service ID (e.g. `service_abc123`)
   - `YOUR_TEMPLATE_ID` → your template ID (e.g. `template_xyz456`)

---

## 🌐 DEPLOYING THE BACKEND

### Option A: Render (Free Tier)
1. Push `Backend/` folder to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your repo
4. **Build command:** `npm install`
5. **Start command:** `node server.js`
6. Add all `.env` variables in **Environment** tab
7. Copy your Render URL and set `KEEP_ALIVE_URL=https://your-app.onrender.com/api/health` in env

### Option B: Railway
1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Add env variables, deploy

### Option C: VPS / DigitalOcean
```bash
# On your server:
git clone your-repo
cd backend
npm install
npm install -g pm2
pm2 start server.js --name "portfolio-backend"
pm2 save
pm2 startup
```

---

## 🤖 CHATBOT FEATURES

| Feature | Works Without Backend | Works With Backend |
|---|---|---|
| Conversation flows | ✅ | ✅ |
| Lead collection | ✅ | ✅ |
| Email via EmailJS | ✅ | ✅ |
| Email via Nodemailer | ❌ | ✅ |
| Save leads to MongoDB | ❌ | ✅ |
| LocalStorage backup | ✅ | ✅ |

### Chatbot Flow Summary:
- **Main Menu**: 5 options (Website / Landing Page / Chatbot / Pricing / Contact)
- **Build Website**: Asks business type → budget → timeline → CTA
- **Landing Page**: Asks product → audience → CTA
- **AI Chatbot**: Asks platform → purpose → CTA
- **Pricing**: Shows 3 packages (Basic/Standard/Premium)
- **Contact**: Collects name → email → phone → details → sends email
- **Smart NLP**: Keyword matching for 10+ intents
- **Fallback**: Human handoff if confused

---

## 📬 API ENDPOINTS

```
GET  /api/health          → Health check
POST /api/contact         → Submit contact form
GET  /api/contact         → List contacts (admin token required)
POST /api/chat/lead       → Save chatbot lead
GET  /api/chat/leads      → List chat leads (admin token required)
```

**Admin Access:**
```bash
curl https://your-backend.com/api/contact \
  -H "x-admin-token: your_admin_token"
```

---

## 🔐 SECURITY CHECKLIST

- [ ] `.env` file is in `.gitignore` — never commit it
- [ ] Rate limiting enabled (30 req / 15 min per IP)
- [ ] CORS locked to your frontend domain in production
- [ ] MongoDB user has minimal permissions
- [ ] Admin token is a strong random string
- [ ] Gmail App Password (not real password) used

---

## 📊 VIEW YOUR LEADS

```bash
# View contact form leads
curl https://your-backend.com/api/contact \
  -H "x-admin-token: YOUR_ADMIN_TOKEN"

# View chatbot leads
curl https://your-backend.com/api/chat/leads \
  -H "x-admin-token: YOUR_ADMIN_TOKEN"
```

Or view them directly in **MongoDB Atlas** → Browse Collections.

---

## 🆘 TROUBLESHOOTING

**Emails not sending?**
- Double-check Gmail App Password (not your real password)
- Ensure 2FA is enabled on your Google account
- Check spam folder

**MongoDB not connecting?**
- Whitelist your IP in Atlas → Network Access → `0.0.0.0/0`
- Check MONGO_URI format matches exactly

**Chatbot not responding?**
- Open browser console (F12) for errors
- Ensure `script.js` is loading (check network tab)

**Free hosting sleeping?**
- Set `KEEP_ALIVE_URL` in `.env` to ping your server every 14 min

---

Built with ❤️ by Rishi | rishuchaudhuri11@gmail.com
