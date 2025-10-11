const express = require('express');
const cors = require('cors');
const projectData = require('./data/projects');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Mock credentials
const ADMIN_CREDENTIALS = {
  username: 'Admin',
  password: 'TsAdmin123'
};

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
  
  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
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
    exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
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
  console.log(`   - GET  http://localhost:${PORT}/api/health`);
});

