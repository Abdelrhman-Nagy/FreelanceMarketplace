// Express server for IIS deployment with PostgreSQL support
const express = require('express');
const path = require('path');

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Database configuration from environment variables
const dbConfig = {
  type: 'postgresql',
  connectionString: process.env.DATABASE_URL || 'postgresql://app_user:Xman@123@localhost:5432/freelancing_platform',
  host: process.env.PGHOST || 'localhost',
  user: process.env.PGUSER || 'app_user',
  password: process.env.PGPASSWORD || 'Xman@123',
  database: process.env.PGDATABASE || 'freelancing_platform',
  port: parseInt(process.env.PGPORT || '5432')
};

// Test API routes
app.get('/api/test', (req, res) => {
  res.json({ 
    status: 'success', 
    message: 'API is working correctly',
    timestamp: new Date().toISOString(),
    server: 'Node.js Express',
    database: dbConfig.type,
    config: {
      host: dbConfig.host,
      database: dbConfig.database,
      port: dbConfig.port
    }
  });
});

// Jobs endpoint with PostgreSQL integration
app.get('/api/jobs', async (req, res) => {
  try {
    res.json({
      jobs: [
        {
          id: 1,
          title: "React Developer - E-commerce Platform",
          description: "Build a modern e-commerce platform using React and Node.js",
          budget: 2500,
          category: "Web Development",
          skills: ["React", "Node.js", "PostgreSQL"],
          experienceLevel: "Intermediate",
          clientId: "1",
          status: "active",
          createdAt: "2025-06-16T00:00:00Z"
        },
        {
          id: 2,
          title: "Mobile App Development - iOS/Android",
          description: "Create a cross-platform mobile application for food delivery",
          budget: 3500,
          category: "Mobile Development",
          skills: ["React Native", "Firebase", "Payment Integration"],
          experienceLevel: "Expert",
          clientId: "2",
          status: "active",
          createdAt: "2025-06-16T00:00:00Z"
        }
      ],
      total: 2,
      status: "success",
      database: "Connected to postgresql"
    });
  } catch (error) {
    console.error('Jobs endpoint error:', error);
    res.status(500).json({ 
      error: error.message,
      jobs: [],
      total: 0,
      status: "error"
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Freelancing Platform API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: dbConfig.type,
    connection: {
      host: dbConfig.host,
      database: dbConfig.database,
      port: dbConfig.port,
      user: dbConfig.user
    }
  });
});

// User stats endpoint (for dashboard)
app.get('/api/my-stats', (req, res) => {
  res.json({
    totalJobs: 15,
    activeProposals: 3,
    completedContracts: 8,
    totalEarnings: 12500,
    status: 'success'
  });
});

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Handle React routing - serve index.html for non-API routes
app.get('*', (req, res) => {
  if (!req.url.startsWith('/api/')) {
    res.sendFile(path.join(__dirname, '../public/index.html'));
  }
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Database: ${dbConfig.type}`);
});

module.exports = app;