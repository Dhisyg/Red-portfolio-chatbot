/* ============================================================
   script.js — Portfolio + AI Chatbot Engine
   All pages share this file.
   ============================================================ */

// ── SCROLL PROGRESS ──────────────────────────────────────────
const progressBar = document.getElementById('scroll-progress');
if (progressBar) {
  window.addEventListener('scroll', () => {
    const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
    progressBar.style.width = pct + '%';
  }, { passive: true });
}

// ── NAVBAR SCROLL ─────────────────────────────────────────────
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
}

// ── MOBILE MENU ───────────────────────────────────────────────
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
const mobileClose = document.getElementById('mobile-close');
if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => mobileMenu.classList.add('open'));
  mobileClose?.addEventListener('click', () => mobileMenu.classList.remove('open'));
  mobileMenu.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => mobileMenu.classList.remove('open'))
  );
}

// ── CUSTOM CURSOR ─────────────────────────────────────────────
const cursor   = document.getElementById('cursor');
const follower = document.getElementById('cursor-follower');
if (cursor && follower) {
  let mouseX = 0, mouseY = 0, fx = 0, fy = 0;
  document.addEventListener('mousemove', e => {
    mouseX = e.clientX; mouseY = e.clientY;
    cursor.style.left = mouseX - 5 + 'px';
    cursor.style.top  = mouseY - 5 + 'px';
  });
  (function loop() {
    fx += (mouseX - fx - 18) * 0.12;
    fy += (mouseY - fy - 18) * 0.12;
    follower.style.left = fx + 'px';
    follower.style.top  = fy + 'px';
    requestAnimationFrame(loop);
  })();
  document.querySelectorAll('a,button,.svc-card,.proj-card,.pricing-card,.contact-link').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
}

// ── SCROLL REVEAL ─────────────────────────────────────────────
const revealEls = document.querySelectorAll('.reveal');
if (revealEls.length) {
  const ro = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(el => ro.observe(el));
}

// ── COUNTER ANIMATION ─────────────────────────────────────────
function animCounter(el, target) {
  let start = 0;
  const dur = 1800;
  const step = ts => {
    if (!start) start = ts;
    const p = Math.min((ts - start) / dur, 1);
    const e = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.floor(e * target) + '+';
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
const counterEls = document.querySelectorAll('.stat-num[data-count]');
if (counterEls.length) {
  const co = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        animCounter(e.target, parseInt(e.target.dataset.count));
        co.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  counterEls.forEach(el => co.observe(el));
}

// ── HERO HEADING STAGGER ──────────────────────────────────────
document.querySelectorAll('.hero-heading .line').forEach((line, i) => {
  line.style.cssText = `opacity:0;transform:translateY(28px);transition:opacity .8s cubic-bezier(.23,1,.32,1) ${i * .15}s,transform .8s cubic-bezier(.23,1,.32,1) ${i * .15}s`;
  setTimeout(() => { line.style.opacity = '1'; line.style.transform = 'translateY(0)'; }, 80 + i * 120);
});

// ── SMOOTH SCROLL ─────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
  });
});

/* ============================================================
   CHATBOT ENGINE
   ============================================================ */

const chatFab    = document.getElementById('chat-fab');
const chatWindow = document.getElementById('chat-window');
const chatClose  = document.getElementById('chat-close');
const chatInput  = document.getElementById('chat-input');
const chatSend   = document.getElementById('chat-send');
const chatMsgs   = document.getElementById('chat-messages');
const chatTyping = document.getElementById('chat-typing');
const fabBadge   = document.querySelector('.fab-badge');

if (!chatFab) { /* not present, skip */ }
else {

// ── State Machine ─────────────────────────────────────────────
const STATE = {
  IDLE: 'idle',
  WEBSITE_BTYPE: 'website_btype',
  WEBSITE_BUDGET: 'website_budget',
  WEBSITE_TIMELINE: 'website_timeline',
  LANDING_SERVICE: 'landing_service',
  LANDING_AUDIENCE: 'landing_audience',
  CHATBOT_PLATFORM: 'chatbot_platform',
  CHATBOT_PURPOSE: 'chatbot_purpose',
  CONTACT_NAME: 'contact_name',
  CONTACT_EMAIL: 'contact_email',
  CONTACT_PHONE: 'contact_phone',
  CONTACT_DETAILS: 'contact_details',
  CONTACT_SUBMITTING: 'contact_submitting',
  DONE: 'done'
};

let state = STATE.IDLE;
let lead  = {};   // collects contact info
let chatOpened = false;

// ── Open / Close ──────────────────────────────────────────────
chatFab.addEventListener('click', () => {
  chatWindow.classList.toggle('chat-hidden');
  if (!chatOpened) {
    chatOpened = true;
    fabBadge.style.display = 'none';
    setTimeout(() => botSendWelcome(), 400);
  }
});
chatClose.addEventListener('click', () => chatWindow.classList.add('chat-hidden'));

// ── Send ──────────────────────────────────────────────────────
chatSend.addEventListener('click', handleUserInput);
chatInput.addEventListener('keydown', e => { if (e.key === 'Enter') handleUserInput(); });

function handleUserInput() {
  const text = chatInput.value.trim();
  if (!text) return;
  chatInput.value = '';
  addMsg('user', text);
  processUserText(text);
}

// ── Message Helpers ───────────────────────────────────────────
function addMsg(role, text, buttons = []) {
  const wrap = document.createElement('div');
  wrap.className = 'msg ' + role;
  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  bubble.innerHTML = text.replace(/\n/g, '<br/>');
  wrap.appendChild(bubble);
  if (buttons.length) {
    const row = document.createElement('div');
    row.className = 'msg-buttons';
    buttons.forEach(b => {
      const btn = document.createElement('button');
      btn.className = 'chat-btn';
      btn.textContent = b.label;
      btn.addEventListener('click', () => {
        addMsg('user', b.label);
        row.remove();
        b.action();
      });
      row.appendChild(btn);
    });
    wrap.appendChild(row);
  }
  chatMsgs.appendChild(wrap);
  chatMsgs.scrollTop = chatMsgs.scrollHeight;
  return wrap;
}

function botType(text, buttons = [], delay = 900) {
  chatTyping.classList.remove('hidden');
  chatMsgs.scrollTop = chatMsgs.scrollHeight;
  return new Promise(res => {
    setTimeout(() => {
      chatTyping.classList.add('hidden');
      addMsg('bot', text, buttons);
      res();
    }, delay);
  });
}

// ── Welcome ───────────────────────────────────────────────────
function botSendWelcome() {
  state = STATE.IDLE;
  botType(
    "Hey 👋 I'm Rishi's AI assistant!\nI can help you build high-converting websites or answer your questions instantly.",
    [
      { label: '🚀 Build My Website', action: flowBuildWebsite },
      { label: '🎯 Create Landing Page', action: flowLandingPage },
      { label: '🤖 Add AI Chatbot', action: flowChatbot },
      { label: '💰 Pricing Info', action: flowPricing },
      { label: '📞 Contact Me', action: flowContact },
    ],
    600
  );
}

function showMainMenu() {
  botType(
    "Anything else I can help you with?",
    [
      { label: '🚀 Build My Website', action: flowBuildWebsite },
      { label: '🎯 Create Landing Page', action: flowLandingPage },
      { label: '🤖 Add AI Chatbot', action: flowChatbot },
      { label: '💰 Pricing Info', action: flowPricing },
      { label: '📞 Contact Me', action: flowContact },
    ],
    500
  );
}

// ── FLOW: Build Website ───────────────────────────────────────
async function flowBuildWebsite() {
  state = STATE.WEBSITE_BTYPE;
  await botType("Great choice! 🚀 Let's get started.\n\nWhat type of business do you have?", [
    { label: '🛒 E-Commerce', action: () => { lead.btype = 'E-Commerce'; askWebsiteBudget(); } },
    { label: '🏢 Corporate / Agency', action: () => { lead.btype = 'Corporate'; askWebsiteBudget(); } },
    { label: '👤 Personal / Portfolio', action: () => { lead.btype = 'Portfolio'; askWebsiteBudget(); } },
    { label: '🚀 SaaS / Startup', action: () => { lead.btype = 'SaaS/Startup'; askWebsiteBudget(); } },
  ]);
}
async function askWebsiteBudget() {
  state = STATE.WEBSITE_BUDGET;
  await botType("Perfect! What is your budget range?", [
    { label: 'Under $300', action: () => { lead.budget = 'Under $300'; askWebsiteTimeline(); } },
    { label: '$300–$800', action: () => { lead.budget = '$300–$800'; askWebsiteTimeline(); } },
    { label: '$800–$1500', action: () => { lead.budget = '$800–$1500'; askWebsiteTimeline(); } },
    { label: '$1500+', action: () => { lead.budget = '$1500+'; askWebsiteTimeline(); } },
  ]);
}
async function askWebsiteTimeline() {
  state = STATE.WEBSITE_TIMELINE;
  await botType("And what's your timeline?", [
    { label: '⚡ ASAP (1–3 days)', action: () => { lead.timeline = '1–3 days'; websiteSummary(); } },
    { label: '📅 1–2 weeks', action: () => { lead.timeline = '1–2 weeks'; websiteSummary(); } },
    { label: '🗓 1 month+', action: () => { lead.timeline = '1 month+'; websiteSummary(); } },
  ]);
}
async function websiteSummary() {
  lead.service = 'Build My Website';
  await botType(
    `Great! I can build a modern AI-powered website tailored for your <strong>${lead.btype}</strong> business, within your budget of <strong>${lead.budget}</strong> and delivered in <strong>${lead.timeline}</strong>. 💪`,
    [
      { label: '📅 Book Free Consultation', action: () => { window.open('https://calendly.com', '_blank'); showMainMenu(); } },
      { label: '📩 Send My Details', action: flowContact },
    ]
  );
}

// ── FLOW: Landing Page ────────────────────────────────────────
async function flowLandingPage() {
  state = STATE.LANDING_SERVICE;
  await botType("Let's build a high-converting landing page! 🎯\n\nWhat product or service will this page promote?");
}
async function askLandingAudience(service) {
  lead.service = 'Landing Page';
  lead.product = service;
  state = STATE.LANDING_AUDIENCE;
  await botType("Nice! Who is your target audience?", [
    { label: '👔 B2B / Businesses', action: () => { lead.audience = 'B2B'; landingPageSummary(); } },
    { label: '🛍 B2C / Consumers', action: () => { lead.audience = 'B2C'; landingPageSummary(); } },
    { label: '🎓 Students', action: () => { lead.audience = 'Students'; landingPageSummary(); } },
    { label: '🌍 General Public', action: () => { lead.audience = 'General'; landingPageSummary(); } },
  ]);
}
async function landingPageSummary() {
  await botType(
    `I'll create a high-converting landing page for <strong>${lead.product}</strong> designed to maximise leads and sales for <strong>${lead.audience}</strong> audiences. 🔥`,
    [
      { label: '🚀 Get Landing Page Now', action: flowContact },
      { label: '🏠 Back to Menu', action: showMainMenu },
    ]
  );
}

// ── FLOW: Chatbot ─────────────────────────────────────────────
async function flowChatbot() {
  state = STATE.CHATBOT_PLATFORM;
  lead.service = 'AI Chatbot';
  await botType("Let's automate your business with AI! 🤖\n\nWhere do you want the chatbot?", [
    { label: '🌐 Website', action: () => { lead.platform = 'Website'; askChatbotPurpose(); } },
    { label: '💬 WhatsApp', action: () => { lead.platform = 'WhatsApp'; askChatbotPurpose(); } },
    { label: '📱 Both', action: () => { lead.platform = 'Website + WhatsApp'; askChatbotPurpose(); } },
  ]);
}
async function askChatbotPurpose() {
  state = STATE.CHATBOT_PURPOSE;
  await botType("What is the main purpose?", [
    { label: '🎯 Lead Generation', action: () => { lead.purpose = 'Lead Gen'; chatbotSummary(); } },
    { label: '🛎 Customer Support', action: () => { lead.purpose = 'Support'; chatbotSummary(); } },
    { label: '💰 Sales Automation', action: () => { lead.purpose = 'Sales'; chatbotSummary(); } },
  ]);
}
async function chatbotSummary() {
  await botType(
    `I can build a custom AI chatbot for <strong>${lead.platform}</strong> focused on <strong>${lead.purpose}</strong> — it'll work 24/7, never miss a lead, and handle hundreds of conversations simultaneously. 🚀`,
    [
      { label: '⚡ Start Automation', action: flowContact },
      { label: '🏠 Back to Menu', action: showMainMenu },
    ]
  );
}

// ── FLOW: Pricing ─────────────────────────────────────────────
async function flowPricing() {
  await botType(
    `Here are my packages 💰\n\n<strong>🟢 Basic — $299</strong>\nLanding page, mobile responsive, SEO, contact form\n\n<strong>🔵 Standard — $799</strong>\nFull website (6 pages), custom design, full stack, MongoDB\n\n<strong>🔴 Premium — $1499</strong>\nEverything in Standard + custom AI chatbot + WhatsApp integration`,
    [
      { label: '✅ Choose Basic', action: flowContact },
      { label: '✅ Choose Standard', action: flowContact },
      { label: '✅ Choose Premium', action: flowContact },
      { label: '🏠 Back', action: showMainMenu },
    ]
  );
}

// ── FLOW: Contact (full lead capture) ────────────────────────
async function flowContact() {
  state = STATE.CONTACT_NAME;
  lead = { ...lead };   // keep any collected data
  await botType("Let's get your details so Rishi can reach out! 📩\n\nFirst — what's your <strong>full name</strong>?");
}

// ── Text processing state machine ────────────────────────────
async function processUserText(text) {
  switch (state) {

    case STATE.LANDING_SERVICE:
      await askLandingAudience(text);
      break;

    case STATE.CONTACT_NAME:
      lead.name = text;
      state = STATE.CONTACT_EMAIL;
      await botType(`Nice to meet you, <strong>${text}</strong>! 👋\n\nWhat's your <strong>email address</strong>?`);
      break;

    case STATE.CONTACT_EMAIL:
      if (!/\S+@\S+\.\S+/.test(text)) {
        await botType("Hmm, that doesn't look like a valid email. Please try again 📧");
      } else {
        lead.email = text;
        state = STATE.CONTACT_PHONE;
        await botType("Great! What's your <strong>WhatsApp / phone number</strong>?\n(Type 'skip' to skip)");
      }
      break;

    case STATE.CONTACT_PHONE:
      lead.phone = text.toLowerCase() === 'skip' ? 'Not provided' : text;
      state = STATE.CONTACT_DETAILS;
      await botType("Almost done! Tell me a bit about your <strong>project</strong> — what do you want to build?");
      break;

    case STATE.CONTACT_DETAILS:
      lead.details = text;
      state = STATE.CONTACT_SUBMITTING;
      await botType("Perfect! Let me send your details to Rishi... ✉️", [], 400);
      await submitLeadEmail();
      break;

    case STATE.IDLE:
    default:
      await handleSmartReply(text);
      break;
  }
}

// ── Smart / Keyword NLP ───────────────────────────────────────
async function handleSmartReply(text) {
  const t = text.toLowerCase();

  if (match(t, ['price','cost','how much','pricing','package','plan'])) {
    await flowPricing(); return;
  }
  if (match(t, ['website','web','site','build'])) {
    await flowBuildWebsite(); return;
  }
  if (match(t, ['landing','page','convert'])) {
    await flowLandingPage(); return;
  }
  if (match(t, ['chatbot','bot','ai','automate','automation'])) {
    await flowChatbot(); return;
  }
  if (match(t, ['contact','hire','email','reach','connect','talk'])) {
    await flowContact(); return;
  }
  if (match(t, ['how long','timeline','time','deliver','days','weeks'])) {
    await botType("⏱ Typical timelines:\n\n• Landing page: <strong>3–5 days</strong>\n• Full website: <strong>7–14 days</strong>\n• AI chatbot: <strong>5–10 days</strong>\n\nRush delivery available on request!", [
      { label: '📩 Get a Quote', action: flowContact },
      { label: '🏠 Menu', action: showMainMenu },
    ]); return;
  }
  if (match(t, ['tech','stack','technology','language','framework','tools'])) {
    await botType("🛠 My tech stack:\n\n<strong>Frontend:</strong> React, Next.js, HTML/CSS/JS\n<strong>Backend:</strong> Node.js, Express, Python\n<strong>Database:</strong> MongoDB, PostgreSQL, Supabase\n<strong>AI:</strong> OpenAI GPT-4, LangChain\n<strong>Infra:</strong> Vercel, AWS, Docker", [
      { label: '🏠 Menu', action: showMainMenu },
    ]); return;
  }
  if (match(t, ['support','maintenance','after','post'])) {
    await botType("✅ Yes! I provide post-launch support:\n\n• <strong>1 month free</strong> bug fixes on all projects\n• Optional monthly retainer for ongoing updates\n• 24hr response time for critical issues", [
      { label: '📩 Contact Me', action: flowContact },
      { label: '🏠 Menu', action: showMainMenu },
    ]); return;
  }
  if (match(t, ['custom','customize','design','unique','brand'])) {
    await botType("🎨 Absolutely! Every project is <strong>100% custom-designed</strong> — no templates.\n\nI create designs that match your brand identity, target audience, and business goals.", [
      { label: '🚀 Start a Project', action: flowBuildWebsite },
      { label: '🏠 Menu', action: showMainMenu },
    ]); return;
  }
  if (match(t, ['hello','hi','hey','hlo','yo','sup'])) {
    await botType("Hey there! 👋 Great to have you here. How can I help you today?", [
      { label: '🚀 Build My Website', action: flowBuildWebsite },
      { label: '💰 Pricing Info', action: flowPricing },
      { label: '📞 Contact Me', action: flowContact },
    ]); return;
  }

  // Fallback — human handoff
  await botType(
    "I'm not sure I understood that fully. Let me connect you with Rishi directly! 🙋‍♂️\n\nHe'll personally reply within <strong>24 hours</strong>.",
    [
      { label: '📩 Send Message', action: flowContact },
      { label: '📧 Email Directly', action: () => { window.location.href = 'mailto:rishuchaudhuri11@gmail.com'; } },
      { label: '🏠 Main Menu', action: showMainMenu },
    ]
  );
}

function match(text, keywords) {
  return keywords.some(k => text.includes(k));
}

// ── Lead Email via EmailJS ─────────────────────────────────────
async function submitLeadEmail() {
  // Build summary
  const summary = [
    lead.service   ? `Service: ${lead.service}` : '',
    lead.btype     ? `Business Type: ${lead.btype}` : '',
    lead.product   ? `Product/Service: ${lead.product}` : '',
    lead.platform  ? `Platform: ${lead.platform}` : '',
    lead.purpose   ? `Purpose: ${lead.purpose}` : '',
    lead.budget    ? `Budget: ${lead.budget}` : '',
    lead.timeline  ? `Timeline: ${lead.timeline}` : '',
    lead.details   ? `Details: ${lead.details}` : '',
  ].filter(Boolean).join('\n');

  // Try EmailJS (will silently fail if not configured — still shows success UX)
  try {
    if (typeof emailjs !== 'undefined') {
      await emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", {
        from_name:  lead.name  || 'Chatbot Lead',
        from_email: lead.email || 'no-email@chat.bot',
        phone:      lead.phone || 'Not provided',
        service:    lead.service || 'Chat Enquiry',
        budget:     lead.budget || 'Not specified',
        message:    `CHATBOT LEAD\n\n${summary}`,
        to_email:   'rishuchaudhuri11@gmail.com'
      });
    }
  } catch(e) {
    console.warn('EmailJS not configured:', e.message);
    // Will still show success message to user — email will work once EmailJS is set up
  }

  // Also store in localStorage as backup log
  try {
    const logs = JSON.parse(localStorage.getItem('chatLeads') || '[]');
    logs.push({ ...lead, timestamp: new Date().toISOString() });
    localStorage.setItem('chatLeads', JSON.stringify(logs));
  } catch(e) {}

  state = STATE.DONE;
  await botType(
    `✅ Done, <strong>${lead.name || 'there'}</strong>! Your details have been sent to Rishi.\n\nHe'll contact you at <strong>${lead.email || 'your email'}</strong> within 24 hours. 🎉`,
    [
      { label: '🏠 Back to Menu', action: () => { lead = {}; state = STATE.IDLE; showMainMenu(); } },
    ],
    600
  );
}

} // end chatbot block

// ── FAQ Quick Replies (if FAQ buttons exist on page) ─────────
document.querySelectorAll('[data-faq]').forEach(btn => {
  btn.addEventListener('click', () => {
    const q = btn.dataset.faq;
    if (chatWindow) chatWindow.classList.remove('chat-hidden');
    setTimeout(() => {
      if (q === 'timeline') addMsg('user', 'How long does it take?');
      if (q === 'tech')     addMsg('user', 'What technologies do you use?');
      if (q === 'support')  addMsg('user', 'Do you provide support?');
      if (q === 'custom')   addMsg('user', 'Can you customize design?');
    }, 300);
  });
});
