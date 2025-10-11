const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
let projectData = require('./data/projects');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Mock credentials
const ADMIN_CREDENTIALS = [
  { username: 'Admin',     password: 'Tsent500$' },
  { username: 'ADMINX',    password: 'Tsent500$' },
  { username: 'UserTsent', password: 'Tsent@2025' },
  { username: 'AdminEnv',  password: 'Tsentsiper2025@' }
];

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Tsentsiper API Server',
    version: '1.0.0',
    endpoints: {
      login: '/api/auth/login',
      projects: '/api/projects',
      health: '/api/health'
    }
  });
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username and password are required'
    });
  }

  const normalizedUsername = String(username).trim();
  const normalizedPassword = String(password).trim();

  // Debug logging
  console.log('Login attempt for user:', normalizedUsername);
  console.log('Available credentials:');
  ADMIN_CREDENTIALS.forEach((cred, i) => {
    console.log(`  ${i}: username="${cred.username}" password="${cred.password}"`);
  });

  const isValid = ADMIN_CREDENTIALS.some(cred => {
    const usernameMatch = cred.username.toLowerCase() === normalizedUsername.toLowerCase();
    const passwordMatch = cred.password === normalizedPassword;
    console.log(`Checking ${cred.username}: usernameMatch=${usernameMatch}, passwordMatch=${passwordMatch}`);
    return usernameMatch && passwordMatch;
  });

  if (isValid) {
    // Generate mock token
    const token = generateToken(username);
    
    res.json({
      success: true,
      message: 'Login successful',
      token: token,
      user: {
        username: username,
        role: 'admin'
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid username or password'
    });
  }
});

// Get all projects
app.get('/api/projects', (req, res) => {
  res.json({
    success: true,
    count: projectData.length,
    data: projectData
  });
});

// Add new project (adds to top)
app.post('/api/projects', (req, res) => {
  const { text } = req.body || {};
  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ success: false, message: 'Text is required' });
  }

  projectData = [text.trim(), ...projectData];
  try {
    saveProjectData(projectData);
    res.json({ success: true, count: projectData.length, data: projectData });
  } catch (e) {
    console.error('Failed to save project data:', e);
    res.status(500).json({ success: false, message: 'Failed to persist data' });
  }
});

// Update project by index
app.put('/api/projects/:index', (req, res) => {
  const index = Number(req.params.index);
  const { text } = req.body || {};
  if (!Number.isInteger(index) || index < 0 || index >= projectData.length) {
    return res.status(400).json({ success: false, message: 'Invalid index' });
  }
  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ success: false, message: 'Text is required' });
  }

  projectData[index] = text.trim();
  try {
    saveProjectData(projectData);
    res.json({ success: true, count: projectData.length, data: projectData });
  } catch (e) {
    console.error('Failed to save project data:', e);
    res.status(500).json({ success: false, message: 'Failed to persist data' });
  }
});

// Delete project by index
app.delete('/api/projects/:index', (req, res) => {
  const index = Number(req.params.index);
  if (!Number.isInteger(index) || index < 0 || index >= projectData.length) {
    return res.status(400).json({ success: false, message: 'Invalid index' });
  }

  projectData.splice(index, 1);
  try {
    saveProjectData(projectData);
    res.json({ success: true, count: projectData.length, data: projectData });
  } catch (e) {
    console.error('Failed to save project data:', e);
    res.status(500).json({ success: false, message: 'Failed to persist data' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Helper function to generate mock token
function generateToken(username) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const payload = Buffer.from(JSON.stringify({ 
    sub: username, 
    iat: Date.now(),
    exp: Date.now() + (30 * 60 * 1000) // 30 minutes
  })).toString('base64');
  const signature = Buffer.from('mock-signature-' + Date.now()).toString('base64');
  
  return `${header}.${payload}.${signature}`;
}

// Persist data back to backend/data/projects.js
function saveProjectData(data) {
  const filePath = path.join(__dirname, 'data', 'projects.js');
  const serialized = serializeProjectArray(data);
  fs.writeFileSync(filePath, serialized, 'utf8');
}

function escapeBackticks(text) {
  return String(text).replace(/`/g, '\\`');
}

function serializeProjectArray(arr) {
  const lines = arr.map(item => `  \`${escapeBackticks(item)}\``).join(',\n');
  return `const projectData = [\n${lines}\n];\n\nmodule.exports = projectData;\n\n`;
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints:`);
  console.log(`   - POST http://localhost:${PORT}/api/auth/login`);
  console.log(`   - GET  http://localhost:${PORT}/api/projects`);
  console.log(`   - GET  http://localhost:${PORT}/api/health`);
});

