import Hapi from '@hapi/hapi';
import Inert from '@hapi/inert';
import Vision from '@hapi/vision';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Hapi server
const server = Hapi.server({
  port: process.env.PORT || 5000,
  host: '0.0.0.0',
  routes: {
    cors: {
      origin: ['*'],
      headers: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
      additionalHeaders: ['cache-control', 'x-requested-with']
    },
    files: {
      relativeTo: path.join(__dirname, '../public')
    }
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

// Test API route
server.route({
  method: 'GET',
  path: '/api/test',
  handler: (request, h) => {
    return {
      status: 'success',
      message: 'API is working correctly',
      timestamp: new Date().toISOString(),
      server: 'Node.js Hapi',
      database: dbConfig.type,
      config: {
        host: dbConfig.host,
        database: dbConfig.database,
        port: dbConfig.port
      }
    };
  }
});

app.get('/api/jobs', async (req, res) => {
  try {
    // Sample data for development
    res.json({
      jobs: [
        {
          id: 1,
          title: 'React Developer - E-commerce Platform',
          description: 'Build a modern e-commerce platform using React and Node.js',
          budget: 2500,
          category: 'Web Development',
          skills: ['React', 'Node.js', 'PostgreSQL'],
          experienceLevel: 'Intermediate',
          clientId: '1',
          status: 'active',
          createdAt: '2025-06-16T00:00:00Z'
        },
        {
          id: 2,
          title: 'Mobile App Development - iOS/Android',
          description: 'Create a cross-platform mobile application for food delivery',
          budget: 3500,
          category: 'Mobile Development',
          skills: ['React Native', 'Firebase', 'Payment Integration'],
          experienceLevel: 'Expert',
          clientId: '2',
          status: 'active',
          createdAt: '2025-06-16T00:00:00Z'
        }
      ],
      total: 2,
      status: 'success',
      database: 'Connected to ' + dbConfig.type
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Database connection failed',
      message: error.message,
      status: 'error'
    });
  }
});

app.get('/api/auth/user', (req, res) => {
  // Return 401 for unauthenticated users (normal for testing)
  res.status(401).json({ 
    message: 'Unauthorized - User not logged in',
    status: 'unauthenticated',
    info: 'This is expected when not logged in'
  });
});

// Health check endpoint
server.route({
  method: 'GET',
  path: '/api/health',
  handler: (request, h) => {
    return {
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
    };
  }
});

// User stats endpoint (for dashboard)
app.get('/api/my-stats', (req, res) => {
  res.json({
    totalJobs: 2,
    activeProposals: 1,
    completedContracts: 3,
    totalEarnings: 15750,
    status: 'success'
  });
});

// Messages endpoint
app.get('/api/messages/unread/count', (req, res) => {
  res.json({
    count: 0,
    status: 'success'
  });
});

// My jobs endpoint
app.get('/api/my-jobs', (req, res) => {
  res.json([
    {
      id: 1,
      title: 'React Developer - E-commerce Platform',
      status: 'active',
      budget: 2500,
      proposals: 5,
      createdAt: '2025-06-16T00:00:00Z'
    }
  ]);
});

// Serve static files from React build
app.use(express.static('dist'));

// Catch all API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    path: req.path,
    method: req.method,
    availableEndpoints: [
      'GET /api/test',
      'GET /api/health',
      'GET /api/jobs',
      'GET /api/auth/user',
      'GET /api/my-stats',
      'GET /api/messages/unread/count',
      'GET /api/my-jobs'
    ]
  });
});

// Serve the React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Start the server
const PORT = parseInt(process.env.PORT || '5000');
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;