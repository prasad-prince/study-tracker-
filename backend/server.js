import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
const { sign: jwtSign, verify: jwtVerify } = jwt;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Serve static frontend
const FRONTEND_DIR = path.resolve(__dirname, '../fornted');
app.use(express.static(FRONTEND_DIR));

// Health check API
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Users store with file persistence (simple demo)
const DATA_DIR = path.resolve(__dirname, './data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const USERDATA_FILE = path.join(DATA_DIR, 'userdata.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadUsersFromFile() {
  try {
    ensureDataDir();
    if (!fs.existsSync(USERS_FILE)) {
      fs.writeFileSync(USERS_FILE, JSON.stringify({ users: [] }, null, 2));
      return new Map();
    }
    const raw = fs.readFileSync(USERS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    const map = new Map();
    for (const u of parsed.users || []) {
      map.set(String(u.email).toLowerCase(), u);
    }
    return map;
  } catch (e) {
    console.error('Failed to load users.json:', e);
    return new Map();
  }
}

function saveUsersToFile(usersMap) {
  try {
    ensureDataDir();
    const usersArr = Array.from(usersMap.values());
    fs.writeFileSync(USERS_FILE, JSON.stringify({ users: usersArr }, null, 2));
  } catch (e) {
    console.error('Failed to save users.json:', e);
  }
}

function loadUserData() {
  try {
    ensureDataDir();
    if (!fs.existsSync(USERDATA_FILE)) {
      fs.writeFileSync(USERDATA_FILE, JSON.stringify({ data: {} }, null, 2));
      return {};
    }
    const raw = fs.readFileSync(USERDATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return parsed.data || {};
  } catch (e) {
    console.error('Failed to load userdata.json:', e);
    return {};
  }
}

function saveUserData(dataObj) {
  try {
    ensureDataDir();
    fs.writeFileSync(USERDATA_FILE, JSON.stringify({ data: dataObj }, null, 2));
  } catch (e) {
    console.error('Failed to save userdata.json:', e);
  }
}

const users = loadUsersFromFile(); // key: email, value: { name, email, password }
let userData = loadUserData(); // key: email, value: { notes, attendance, calculator }

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

// Register
app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body || {};
  console.log('POST /api/register body:', req.body);
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email, password required' });
  }
  const normalizedEmail = String(email).toLowerCase();
  if (users.has(normalizedEmail)) {
    return res.status(409).json({ error: 'Email already registered' });
  }
  const passwordHash = bcrypt.hashSync(password, 10);
  users.set(normalizedEmail, { name, email: normalizedEmail, passwordHash });
  saveUsersToFile(users);
  res.status(201).json({ message: 'Registered', user: { name, email: normalizedEmail } });
});

// Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body || {};
  console.log('POST /api/login body:', req.body);
  if (!email || !password) {
    return res.status(400).json({ error: 'email, password required' });
  }
  const normalizedEmail = String(email).toLowerCase();
  const user = users.get(normalizedEmail);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Support legacy users stored with plaintext password, and migrate to hash
  let isValid = false;
  if (user.passwordHash) {
    try {
      isValid = bcrypt.compareSync(password, user.passwordHash);
    } catch (_) {
      isValid = false;
    }
  } else if (user.password) {
    // Legacy fallback: compare plaintext once, then upgrade to hash
    if (user.password === password) {
      isValid = true;
      const newHash = bcrypt.hashSync(password, 10);
      users.set(normalizedEmail, { name: user.name, email: user.email, passwordHash: newHash });
      saveUsersToFile(users);
    }
  }

  if (!isValid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwtSign({ email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '2h' });
  res.json({ message: 'Logged in', token, user: { name: user.name, email: user.email } });
});

// Current user (mock)
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    const payload = jwtVerify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

app.get('/api/me', authMiddleware, (req, res) => {
  res.json({ user: { name: req.user.name, email: req.user.email } });
});

app.post('/api/logout', (req, res) => {
  // For stateless JWT, client just discards token
  res.json({ message: 'Logged out' });
});

// AI assistant: uses Google Gemini if GOOGLE_API_KEY is set, otherwise simple fallback
app.post('/api/assistant', async (req, res) => {
  const body = req.body || {};
  const userMessage = body.message ? String(body.message) : '';
  const action = body.action ? String(body.action) : '';
  const topic = body.topic ? String(body.topic) : '';
  const text = body.text ? String(body.text) : '';
  const history = Array.isArray(body.history) ? body.history : [];

  async function llmReply(prompt) {
    // Prefer OpenAI if OPENAI_API_KEY is provided
    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey) {
      try {
        const historyMessages = history
          .slice(-10)
          .map(h => ({ role: h.role === 'bot' ? 'assistant' : 'user', content: String(h.content || '') }));
        const resp = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            temperature: 0.4,
            messages: [
              { role: 'system', content: 'You are a helpful assistant for a student study tracker website. Keep replies concise and practical.' },
              ...historyMessages,
              { role: 'user', content: prompt }
            ]
          })
        });
        if (!resp.ok) {
          const t = await resp.text().catch(() => '');
          console.warn('OpenAI HTTP error:', resp.status, t);
          return { text: null, provider: 'openai', error: `HTTP ${resp.status}` };
        } else {
          const data = await resp.json();
          const msg = data?.choices?.[0]?.message?.content || null;
          if (msg) return { text: msg, provider: 'openai' };
        }
      } catch (e) {
        console.warn('OpenAI fetch failed:', e);
        return { text: null, provider: 'openai', error: 'network' };
      }
    }

    // Fallback to Google Gemini if available
    const geminiKey = process.env.GOOGLE_API_KEY;
    if (geminiKey) {
      try {
        const contents = [];
        history.slice(-10).forEach(h => {
          contents.push({ role: h.role === 'bot' ? 'model' : 'user', parts: [{ text: String(h.content || '') }] });
        });
        contents.push({ role: 'user', parts: [{ text: prompt }] });
        const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}` , {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents })
        });
        if (!resp.ok) {
          const t = await resp.text().catch(() => '');
          console.warn('Gemini HTTP error:', resp.status, t);
          return { text: null, provider: 'gemini', error: `HTTP ${resp.status}` };
        } else {
          const data = await resp.json();
          const out = data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
          if (out) return { text: out, provider: 'gemini' };
        }
      } catch (err) {
        console.warn('Gemini fetch failed:', err);
        return { text: null, provider: 'gemini', error: 'network' };
      }
    }
    return { text: null, provider: 'fallback' };
  }

  function fallbackReply(text) {
    const t = String(text || '').toLowerCase();
    if (!t) return 'Please type your question.';
    if (t.includes('task')) return 'Go to Tasks, type your task, then click Add.';
    if (t.includes('note')) return 'Open Notes to write and save your notes.';
    if (t.includes('login') || t.includes('register') || t.includes('signup')) return 'Register first, then Login to access your dashboard.';
    if (t.includes('contact')) return 'Use the Contact page form to send a message.';
    if (t.includes('dark') || t.includes('theme')) return 'Use the Dark button on the header to toggle dark mode.';
    if (t.includes('help')) return 'Ask about tasks, notes, login, contact, or general usage.';
    return "I'm here to help. Ask about tasks, notes, login, or contact.";
  }

  try {
    // Handle structured actions first
    if (action === 'summary') {
      const prompt = `Summarize the following text in 5-7 concise bullet points:\n\n${text || userMessage}`;
      const out = await llmReply(prompt);
      return res.json({ reply: out.text || fallbackReply(text || userMessage), provider: out.provider, error: out.error });
    }
    if (action === 'notes') {
      const prompt = `Create clear, well-structured study notes with headings and bullet points on: "${topic || userMessage}". Keep it concise.`;
      const out = await llmReply(prompt);
      return res.json({ reply: out.text || fallbackReply(topic || userMessage), provider: out.provider, error: out.error });
    }
    if (action === 'ideas') {
      const prompt = `Brainstorm 5-7 practical project/study ideas related to: "${topic || userMessage}". Use short bullets with one-line descriptions.`;
      const out = await llmReply(prompt);
      return res.json({ reply: out.text || fallbackReply(topic || userMessage), provider: out.provider, error: out.error });
    }
    if (action === 'youtube') {
      // Build simple YouTube search links without API key
      const q = encodeURIComponent(topic || userMessage || 'study tips');
      const base = 'https://www.youtube.com/results?search_query=';
      const links = [
        { title: 'Top search', url: `${base}${q}` },
        { title: 'Explained in 10 minutes', url: `${base}${q}+explained+in+10+minutes` },
        { title: 'Lecture', url: `${base}${q}+lecture` },
        { title: 'Crash course', url: `${base}${q}+crash+course` },
        { title: 'Beginner guide', url: `${base}${q}+for+beginners` }
      ];
      // Try LLM to propose extra queries (optional)
      const out = await llmReply(`Suggest 3 concise YouTube search queries for the topic: ${topic || userMessage}. Return as a simple list.`);
      return res.json({
        reply: 'Here are some helpful YouTube searches:',
        links,
        extraQueries: out.text || '',
        provider: out.provider,
        error: out.error
      });
    }

    // Default free-form chat
    const defaultPrompt = `You are a helpful assistant for a student study tracker website. Keep replies concise and practical.\n\nUser: ${userMessage}`;
    const out = await llmReply(defaultPrompt);
    if (out.text) return res.json({ reply: out.text, provider: out.provider });
    return res.json({ reply: fallbackReply(userMessage), provider: out.provider, error: out.error });
  } catch (e) {
    console.error('assistant error:', e);
    return res.status(500).json({ reply: 'Sorry, something went wrong.' });
  }
});

// Protected user data endpoints
app.get('/api/data', authMiddleware, (req, res) => {
  const email = req.user.email;
  const data = userData[email] || { notes: '', attendance: null, calculator: null };
  res.json({ data });
});

app.post('/api/data', authMiddleware, (req, res) => {
  const email = req.user.email;
  const incoming = req.body || {};
  const current = userData[email] || {};
  const merged = { ...current, ...incoming };
  userData[email] = merged;
  saveUserData(userData);
  res.json({ message: 'Saved', data: merged });
});

// Debug: list all users (do not use in production)
app.get('/api/_debug/users', (req, res) => {
  try {
    const list = Array.from(users.values()).map(u => ({ name: u.name, email: u.email }));
    res.json({ count: list.length, users: list });
  } catch (e) {
    res.status(500).json({ error: 'debug failed' });
  }
});

// Ensure API 404s return JSON, not HTML
app.use('/api', (req, res, next) => {
  res.status(404).json({ error: 'Not found' });
});

// Centralized error handler for APIs
app.use((err, req, res, next) => {
  console.error('API error:', err);
  if (req.path.startsWith('/api')) {
    res.status(500).json({ error: 'Server error' });
  } else {
    next(err);
  }
});

// Root -> serve index.html from frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server at http://localhost:${PORT}`);
});