require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose'); // ADD THIS LINE - Missing mongoose import
const connectDB = require('./config/database');

// Import Models
const User = require('./models/User');
const Task = require('./models/Task');
const Note = require('./models/Note');
const Attendance = require('./models/Attendance');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// ========== AUTHENTICATION ROUTES ==========

// Register User
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const normalizedEmail = email ? String(email).toLowerCase().trim() : '';

    console.log('📝 Registration attempt:', {
      name,
      email: normalizedEmail,
      passwordLength: password?.length
    });

    // Validation
    if (!name || !normalizedEmail || !password) {
      return res.status(400).json({
        error: 'All fields are required',
        details: 'Name, email, and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Invalid password',
        details: 'Password must be at least 6 characters'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      console.log('⚠️ User already exists:', normalizedEmail);
      return res.status(400).json({
        error: 'Email already registered',
        details: 'An account with this email already exists'
      });
    }

    // Create new user
    const user = new User({
      name,
      email: normalizedEmail,
      password,
      role: role || 'student'
    });

    console.log('💾 Saving user to database...');
    await user.save();
    console.log('✅ User saved successfully:', {
      id: user._id,
      email: user.email
    });

    // Verify user was saved correctly
    const verification = await User.findOne({ email: normalizedEmail }).select('+password');
    console.log('🔍 Verification - User in DB:', {
      found: !!verification,
      hashLength: verification?.password?.length,
      email: verification?.email
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('❌ Registration error:', {
      message: error.message,
      code: error.code,
      keyPattern: error.keyPattern
    });

    // Handle MongoDB duplicate key error (unique email constraint)
    if (error.code === 11000) {
      return res.status(400).json({
        error: 'Email already registered',
        details: 'An account with this email already exists'
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        error: 'Validation failed',
        details: messages.join(', ')
      });
    }

    res.status(500).json({
      error: 'Registration failed',
      details: error.message
    });
  }
});

// Login User
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email ? String(email).toLowerCase().trim() : '';

    console.log('🔐 Login attempt:', { email: normalizedEmail });

    // Validation
    if (!normalizedEmail || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    // Find user with password field (normalize incoming email)
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    console.log('📊 User lookup result:', {
      found: !!user,
      email: user?.email,
      hashExists: !!user?.password,
      hashLength: user?.password?.length
    });

    if (!user) {
      console.log('❌ User not found:', normalizedEmail);
      return res.status(401).json({
        error: 'Invalid credentials',
        details: 'Email or password is incorrect'
      });
    }

    // Check password
    console.log('🔍 Comparing passwords...');
    const isPasswordValid = await user.comparePassword(password);
    console.log('🔐 Password comparison result:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('❌ Password mismatch for user:', normalizedEmail);
      return res.status(401).json({
        error: 'Invalid credentials',
        details: 'Email or password is incorrect'
      });
    }

    console.log('✅ Password valid, login successful');

    // Log attendance
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await Attendance.findOneAndUpdate(
      { userId: user._id, date: today },
      {
        $setOnInsert: {
          userId: user._id,
          email: user.email,
          date: today,
          loginTime: new Date(),
          status: 'Present'
        }
      },
      { upsert: true, new: true }
    );

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('❌ Login error:', {
      message: error.message,
      stack: error.stack
    });

    res.status(500).json({
      error: 'Login failed',
      details: error.message
    });
  }
});

// ========== TASK ROUTES ==========

// Get all tasks for authenticated user
app.get('/api/tasks', authenticateToken, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks', details: error.message });
  }
});

// Create new task
app.post('/api/tasks', authenticateToken, async (req, res) => {
  try {
    const { text, priority, deadline } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Task description is required' });
    }

    const task = new Task({
      userId: req.user.id,
      text,
      priority: priority || 'medium',
      deadline: deadline || null
    });

    await task.save();
    res.status(201).json({ success: true, task });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create task', details: error.message });
  }
});

// Update task
app.put('/api/tasks/:id', authenticateToken, async (req, res) => {
  try {
    const { text, priority, status, deadline } = req.body;

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { text, priority, status, deadline },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ success: true, task });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Failed to update task', details: error.message });
  }
});

// Delete task
app.delete('/api/tasks/:id', authenticateToken, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.id 
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ success: true, message: 'Task deleted' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Failed to delete task', details: error.message });
  }
});

// ========== NOTE ROUTES ==========

// Get all notes
app.get('/api/notes', authenticateToken, async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, notes });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ error: 'Failed to fetch notes', details: error.message });
  }
});

// Create note
app.post('/api/notes', authenticateToken, async (req, res) => {
  try {
    const { text, files } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Note content is required' });
    }

    const note = new Note({
      userId: req.user.id,
      text,
      files: files || []
    });

    await note.save();
    res.status(201).json({ success: true, note });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ error: 'Failed to create note', details: error.message });
  }
});

// Delete note
app.delete('/api/notes/:id', authenticateToken, async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.id 
    });

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json({ success: true, message: 'Note deleted' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ error: 'Failed to delete note', details: error.message });
  }
});

// ========== ATTENDANCE ROUTES ==========

// Get attendance records
app.get('/api/attendance', authenticateToken, async (req, res) => {
  try {
    const attendance = await Attendance.find({ userId: req.user.id })
      .sort({ date: -1 })
      .limit(30);
    
    res.json({ success: true, attendance });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ error: 'Failed to fetch attendance', details: error.message });
  }
});

// Update logout time
app.post('/api/attendance/logout', authenticateToken, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({ 
      userId: req.user.id, 
      date: today 
    });

    if (attendance && attendance.loginTime) {
      const logoutTime = new Date();
      const duration = Math.round((logoutTime - attendance.loginTime) / 60000); // minutes

      attendance.logoutTime = logoutTime;
      attendance.duration = duration;
      await attendance.save();

      res.json({ success: true, attendance });
    } else {
      res.status(404).json({ error: 'No login record found for today' });
    }
  } catch (error) {
    console.error('Logout attendance error:', error);
    res.status(500).json({ error: 'Failed to update logout time', details: error.message });
  }
});

// ========== CONTACT FORM ==========
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ 
        error: 'All fields are required',
        details: 'Please provide name, email, and message'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Invalid email format',
        details: 'Please provide a valid email address'
      });
    }

    const wordCount = message.trim().split(/\s+/).filter(word => word.length > 0).length;
    if (wordCount < 20) {
      return res.status(400).json({ 
        error: 'Message too short',
        details: `Message must contain at least 20 words. Current: ${wordCount} words`
      });
    }

    console.log('Contact form submission:', { name, email, message, wordCount });

    res.status(200).json({ 
      success: true,
      message: 'Thank you for your message. We will get back to you soon!'
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: 'Something went wrong while processing your message'
    });
  }
});

// ========== DEBUG ENDPOINTS ==========

// Debug: Test password hashing and verification
app.post('/api/debug/test-password', async (req, res) => {
  try {
    const { testPassword, storedEmail } = req.body;

    if (!testPassword || !storedEmail) {
      return res.status(400).json({
        error: 'testPassword and storedEmail required'
      });
    }

    console.log('\n🔍 === PASSWORD DEBUG TEST ===');
    console.log('1️⃣ Test password:', testPassword);
    console.log('   Password length:', testPassword.length);

    // Find user
    const user = await User.findOne({ email: storedEmail.toLowerCase().trim() }).select('+password');

    if (!user) {
      return res.json({
        success: false,
        message: 'User not found',
        email: storedEmail.toLowerCase().trim()
      });
    }

    console.log('2️⃣ User found:', user.email);
    console.log('   Stored hash:', user.password);
    console.log('   Hash length:', user.password?.length);
    console.log('   Hash starts with $2:', user.password?.startsWith('$2'));

    // Try to compare
    const bcrypt = require('bcryptjs');
    const isMatch = await bcrypt.compare(testPassword, user.password);

    console.log('3️⃣ Password comparison result:', isMatch);
    console.log('   isMatch === true:', isMatch === true);
    console.log('   typeof isMatch:', typeof isMatch);

    res.json({
      success: true,
      userFound: true,
      email: user.email,
      hashLength: user.password?.length,
      hashPrefix: user.password?.substring(0, 10),
      passwordMatch: isMatch,
      testPassword: testPassword,
      note: 'If passwordMatch is false, the password stored during registration was different from test password'
    });

  } catch (error) {
    console.error('❌ Debug test error:', error);
    res.status(500).json({
      error: error.message
    });
  }
});

// Get all users (DEBUG ONLY - remove in production)
app.get('/api/debug/users', async (req, res) => {
  try {
    const users = await User.find({}).select('+password');
    res.json({
      count: users.length,
      users: users.map(u => ({
        id: u._id,
        email: u.email,
        name: u.name,
        hashLength: u.password?.length,
        hashPrefix: u.password?.substring(0, 20),
        createdAt: u.createdAt,
        fullObject: u  // Show FULL object for debugging
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get raw MongoDB user data
app.get('/api/debug/users-raw', async (req, res) => {
  try {
    const users = await User.collection.find({}).toArray();
    res.json({
      count: users.length,
      users: users
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== AI ASSISTANT ==========
app.post('/api/assistant', async (req, res) => {
  try {
    const { message, relevantNotes, userRole } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        error: 'Message is required'
      });
    }

    const query = message.toLowerCase();
    let reply = "";
    let provider = "fallback";

    // Enhanced contextual responses for Study Tracker
    if (query.includes('💡') || query.includes('ideas')) {
      reply = "Here are some project ideas based on your query: \n1. Build a Personal Finance Tracker\n2. Create a Weather Dashboard using Fetch API\n3. Develop a Recipe Finder app\n4. Design a Portfolio Website.";
      provider = "assistant";
    } else if (query.includes('📝') || query.includes('notes')) {
      if (relevantNotes) {
        reply = `I found some notes that might help. Based on your study patterns, you should focus on the key concepts mentioned in your notes. Would you like me to summarize them further?`;
      } else {
        reply = "It seems you haven't created any notes on this topic yet. You can go to the Notes page to add some!";
      }
      provider = "assistant";
    } else if (query.includes('📄') || query.includes('summary')) {
      reply = "To provide a good summary, I need more context. However, generally, summarizing involves identifying the main idea and supporting details while omitting redundant information.";
      provider = "assistant";
    } else if (query.includes('🎥') || query.includes('youtube')) {
      reply = "I recommend checking out channels like 'Traversy Media', 'The Net Ninja', or 'Web Dev Simplified' for high-quality educational content on this topic.";
      provider = "assistant";
    } else {
      reply = `I received your message: "${message}". As your Study Tracker AI, I'm here to help you manage your tasks and notes. How can I assist you today?`;
    }

    res.json({
      success: true,
      reply,
      provider
    });
  } catch (error) {
    console.error('Assistant error:', error);
    res.status(500).json({
      error: 'Failed to process request',
      reply: 'Sorry, I encountered an error. Please try again.'
    });
  }
});

// ========== ADMIN ROUTES ==========

// Get all users (admin only)
app.get('/api/admin/users', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied - Admin only' });
    }

    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    res.json({ success: true, users, total: users.length });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users', details: error.message });
  }
});

// Get all notes (admin only)
app.get('/api/admin/notes', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied - Admin only' });
    }

    const notes = await Note.find({})
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, notes, total: notes.length });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ error: 'Failed to fetch notes', details: error.message });
  }
});

// Get all tasks (admin only)
app.get('/api/admin/tasks', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied - Admin only' });
    }

    const tasks = await Task.find({})
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, tasks, total: tasks.length });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks', details: error.message });
  }
});

// Get all attendance records (admin only)
app.get('/api/admin/attendance', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied - Admin only' });
    }

    const attendance = await Attendance.find({})
      .populate('userId', 'name email')
      .sort({ date: -1 });

    res.json({ success: true, attendance, total: attendance.length });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ error: 'Failed to fetch attendance', details: error.message });
  }
});

// Get dashboard statistics (admin only)
app.get('/api/admin/stats', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied - Admin only' });
    }

    const stats = {
      totalUsers: await User.countDocuments(),
      totalNotes: await Note.countDocuments(),
      totalTasks: await Task.countDocuments(),
      totalAttendance: await Attendance.countDocuments(),

      // Task stats
      tasksCompleted: await Task.countDocuments({ status: 'Done' }),
      tasksPending: await Task.countDocuments({ status: 'Pending' }),
      tasksInProgress: await Task.countDocuments({ status: 'In Progress' }),

      // Attendance stats
      presentToday: await Attendance.countDocuments({
        date: new Date().setHours(0, 0, 0, 0),
        status: 'Present'
      }),
      absentToday: await Attendance.countDocuments({
        date: new Date().setHours(0, 0, 0, 0),
        status: 'Absent'
      })
    };

    res.json({ success: true, stats });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics', details: error.message });
  }
});

// ========== SERVE HTML FILES ==========
const pages = [
  'index', 'login', 'register', 'dashboard', 'tasks', 'notes',
  'students', 'reports', 'attendance', 'profile', 'assistant',
  'calculator', 'contact', 'admin'
];

// FIXED: Moved this inside the forEach loop
pages.forEach(page => {
  app.get(`/${page}.html`, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', `${page}.html`));
  });
  
  // FIXED: Added this route inside forEach
  app.get(`/${page}`, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', `${page}.html`));
  });
});

// Home route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// Start server with error handling
const server = app.listen(PORT, () => {
  console.log(`✨ Study Tracker Server running on port ${PORT}`);
  console.log(`🌐 Access at: http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`⚠️ Port ${PORT} is already in use. Please stop the process using this port or set PORT in .env.`);
    console.error(`Try: npx kill-port ${PORT}  (or use Task Manager/Activity Monitor to stop the process)
`);
  } else {
    console.error('Server error:', err);
  }
  process.exit(1);
});