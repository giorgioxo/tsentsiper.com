const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const { init, validateUser, getProjectsStrings, addProjectText, updateProjectByIndex, deleteProjectByIndex } = require('./db');
const { getProjectsStringsByCategory, getCategoriesWithCounts } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Disable caching to avoid 304 for API responses
app.set('etag', false);
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

// Initialize DB and seed from local files if present
init({
  adminCredentials: [
    { username: 'Admin',     password: 'Tsent500$' },
    { username: 'ADMINX',    password: 'Tsent500$' },
    { username: 'UserTsent', password: 'Tsent@2025' },
    { username: 'AdminEnv',  password: 'Tsentsiper2025@' }
  ],
  seedAllPath: 'C:/Users/User/OneDrive/Desktop/All data.txt',
  seedCategoriesPath: 'C:/Users/User/OneDrive/Desktop/filtered data by category..txt'
}).then(() => console.log('SQLite initialized')).catch(err => console.error('SQLite init error:', err));

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Tsentsiper API Server',
    version: '1.2.0',
    endpoints: {
      login: '/api/auth/login',
      projects: '/api/projects',
      categories: '/api/categories',
      health: '/api/health'
    }
  });
});

// Login endpoint (DB only)
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required' });
  }
  try {
    const ok = await validateUser(String(username).trim(), String(password).trim());
    if (!ok) return res.status(401).json({ success: false, message: 'Invalid username or password' });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Authentication failed' });
  }
  const token = generateToken(username);
  res.json({ success: true, message: 'Login successful', token, user: { username, role: 'admin' } });
});

// Get projects (optional category filter)
app.get('/api/projects', async (req, res) => {
  const category = (req.query?.category || '').trim();
  try {
    const data = category ? await getProjectsStringsByCategory(category) : await getProjectsStrings();
    res.json({ success: true, count: data.length, data });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to load projects' });
  }
});

// Add project
app.post('/api/projects', async (req, res) => {
  const { text } = req.body || {};
  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ success: false, message: 'Text is required' });
  }
  try {
    await addProjectText(text);
    const data = await getProjectsStrings();
    res.json({ success: true, count: data.length, data });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to add project' });
  }
});

// Update project by index in DESC order
app.put('/api/projects/:index', async (req, res) => {
  const index = Number(req.params.index);
  const { text } = req.body || {};
  if (!Number.isInteger(index) || index < 0) {
    return res.status(400).json({ success: false, message: 'Invalid index' });
  }
  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ success: false, message: 'Text is required' });
  }
  try {
    const ok = await updateProjectByIndex(index, text);
    if (!ok) return res.status(400).json({ success: false, message: 'Invalid index' });
    const data = await getProjectsStrings();
    res.json({ success: true, count: data.length, data });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to update project' });
  }
});

// Delete project by index in DESC order
app.delete('/api/projects/:index', async (req, res) => {
  const index = Number(req.params.index);
  if (!Number.isInteger(index) || index < 0) {
    return res.status(400).json({ success: false, message: 'Invalid index' });
  }
  try {
    const ok = await deleteProjectByIndex(index);
    if (!ok) return res.status(400).json({ success: false, message: 'Invalid index' });
    const data = await getProjectsStrings();
    res.json({ success: true, count: data.length, data });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to delete project' });
  }
});

// List categories with counts
app.get('/api/categories', async (req, res) => {
  try {
    const rows = await getCategoriesWithCounts();
    res.json({ success: true, count: rows.length, data: rows });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to load categories' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// Helper function to generate mock token
function generateToken(username) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const payload = Buffer.from(JSON.stringify({ 
    sub: username, 
    iat: Date.now(),
    exp: Date.now() + (30 * 60 * 1000)
  })).toString('base64');
  const signature = Buffer.from('mock-signature-' + Date.now()).toString('base64');
  return `${header}.${payload}.${signature}`;
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints:`);
  console.log(`   - POST http://localhost:${PORT}/api/auth/login`);
  console.log(`   - GET  http://localhost:${PORT}/api/projects`);
  console.log(`   - GET  http://localhost:${PORT}/api/categories`);
  console.log(`   - GET  http://localhost:${PORT}/api/health`);
});

