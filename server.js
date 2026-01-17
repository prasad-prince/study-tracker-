const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Demo users (in production, use database)
const users = {
  'student@example.com': {
    name: 'John Student',
    email: 'student@example.com',
    password: 'student123',
    role: 'student'
  },
  'admin@example.com': {
    name: 'Jane Admin',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin'
  }
};

// Login endpoint
app.post('/api/login', (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ error: 'Email, password, and role are required' });
  }

  const user = users[email];
  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }

  if (user.password !== password) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  if (user.role !== role) {
    return res.status(401).json({ error: `Role mismatch: account is ${user.role}` });
  }

  // Generate simple token (in production, use JWT)
  const token = 'tok_' + Math.random().toString(36).slice(2) + '_' + Date.now();

  res.json({
    token: token,
    user: {
      email: user.email,
      name: user.name,
      role: user.role
    }
  });
});

// Serve static files from fornted folder
app.use(express.static('fornted'));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
