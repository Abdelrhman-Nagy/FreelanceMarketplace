import express from 'express';
import cors from 'cors';
import dbService from './database.js';

const app = express();
const PORT = process.env.PORT || process.env.IISNODE_PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/api/test', async (req, res) => {
  try {
    const testConnection = await dbService.testConnection();
    res.json({
      status: 'success',
      message: 'API is working correctly',
      timestamp: new Date().toISOString(),
      server: 'Node.js Express',
      environment: process.env.NODE_ENV || 'development',
      database: testConnection.status,
      config: testConnection.config || {}
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'API working but database connection failed',
      error: error.message,
      timestamp: new Date().toISOString(),
      server: 'Node.js Express',
      environment: process.env.NODE_ENV || 'development'
    });
  }
});

// Jobs endpoint
app.get('/api/jobs', async (req, res) => {
  try {
    console.log('Jobs endpoint called');
    const jobs = await dbService.getJobs();
    console.log('Jobs retrieved, count:', jobs.length);
    
    res.json({
      jobs: jobs,
      total: jobs.length,
      status: 'success',
      database: 'Connected to PostgreSQL'
    });
  } catch (error) {
    console.error('Jobs endpoint error:', error);
    console.error('Error stack:', error.stack);
    res.json({
      error: error.message,
      jobs: [],
      total: 0,
      status: 'error',
      database: 'Error occurred'
    });
  }
});

// Job detail endpoint
app.get('/api/jobs/:id', async (req, res) => {
  try {
    const jobId = parseInt(req.params.id);
    const job = await dbService.getJobById(jobId);
    
    if (!job) {
      return res.status(404).json({
        error: 'Job not found',
        status: 'error'
      });
    }
    
    res.json({
      job: job,
      status: 'success'
    });
  } catch (error) {
    console.error('Job detail endpoint error:', error);
    res.json({
      error: error.message,
      status: 'error'
    });
  }
});

// Projects endpoint
app.get('/api/projects', async (req, res) => {
  try {
    const userId = req.query.userId || 'freelancer_001';
    const userType = req.query.userType || 'freelancer';
    
    const projects = await dbService.getUserProjects(userId, userType);
    res.json({
      projects: projects,
      total: projects.length,
      status: 'success'
    });
  } catch (error) {
    console.error('Projects endpoint error:', error);
    res.json({
      error: error.message,
      projects: [],
      total: 0,
      status: 'error'
    });
  }
});

// Proposals endpoint
app.get('/api/proposals', async (req, res) => {
  try {
    const userId = req.query.userId || 'freelancer_001';
    
    const proposals = await dbService.getUserProposals(userId);
    res.json({
      proposals: proposals,
      total: proposals.length,
      status: 'success'
    });
  } catch (error) {
    console.error('Proposals endpoint error:', error);
    res.json({
      error: error.message,
      proposals: [],
      total: 0,
      status: 'error'
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'FreelancingPlatform API',
    status: 'running',
    timestamp: new Date().toISOString(),
    server: 'Express.js',
    endpoints: [
      'GET /api/test',
      'GET /api/jobs',
      'GET /api/jobs/:id',
      'GET /api/projects',
      'GET /api/proposals'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Endpoint not found',
    path: req.path
  });
});

// Start server
const server = app.listen(PORT, HOST, () => {
  console.log(`Server running on ${HOST}:${PORT}`);
  console.log('Environment:', process.env.NODE_ENV || 'development');
  console.log('Server:', 'Express.js');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
  process.exit(1);
});

export default app;