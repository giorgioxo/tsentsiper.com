const express = require('express');
const cors = require('cors');
const projectData = require('./data/projects');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Tsentsiper API Server',
    version: '1.0.0',
    endpoints: {
      projects: '/api/projects',
      health: '/api/health'
    }
  });
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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints:`);
  console.log(`   - GET http://localhost:${PORT}/api/projects`);
  console.log(`   - GET http://localhost:${PORT}/api/health`);
});

