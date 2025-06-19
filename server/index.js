import Hapi from '@hapi/hapi';
import Inert from '@hapi/inert';
import Vision from '@hapi/vision';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import dbService from './database.js';

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

// Database service handles all SQL Server connections

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
      database: 'sqlserver',
      config: {
        server: process.env.DB_SERVER || 'localhost',
        database: process.env.DB_DATABASE || 'freelancing_platform',
        port: parseInt(process.env.DB_PORT || '1433')
      }
    };
  }
});

// Health check endpoint - tests SQL Server connection
server.route({
  method: 'GET',
  path: '/api/health',
  handler: async (request, h) => {
    const dbTest = await dbService.testConnection();

    return {
      status: 'healthy',
      service: 'Freelancing Platform API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: 'sqlserver',
      connection: {
        server: process.env.DB_SERVER || 'localhost',
        database: process.env.DB_DATABASE || 'freelancing_platform',
        port: parseInt(process.env.DB_PORT || '1433'),
        user: process.env.DB_USER || 'app_user',
        status: dbTest.status,
        error: dbTest.error
      }
    };
  }
});

// User stats endpoint - gets data from SQL Server
server.route({
  method: 'GET',
  path: '/api/my-stats',
  handler: async (request, h) => {
    try {
      // In a real app, this would come from authentication
      const userId = 'freelancer_001';
      const stats = await dbService.getUserStats(userId);
      
      return {
        ...stats,
        status: 'success'
      };
    } catch (error) {
      console.error('Stats endpoint error:', error);
      return h.response({
        error: error.message,
        status: 'error'
      }).code(500);
    }
  }
});

// Job detail endpoint - gets specific job from SQL Server
server.route({
  method: 'GET',
  path: '/api/jobs/{id}',
  handler: async (request, h) => {
    try {
      const jobId = request.params.id;
      const job = await dbService.getJobById(jobId);
      
      if (!job) {
        return h.response({
          error: 'Job not found',
          status: 'error'
        }).code(404);
      }
      
      return {
        job: job,
        status: 'success'
      };
    } catch (error) {
      console.error('Job detail endpoint error:', error);
      return h.response({
        error: error.message,
        status: 'error'
      }).code(500);
    }
  }
});

// Serve React source files with proper MIME types
server.route({
  method: 'GET',
  path: '/src/{param*}',
  handler: (request, h) => {
    const filePath = request.params.param;
    const response = h.file(filePath);
    
    // Set correct MIME type for TypeScript files
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      return response.type('application/javascript');
    }
    if (filePath.endsWith('.css')) {
      return response.type('text/css');
    }
    
    return response;
  },
  options: {
    files: {
      relativeTo: path.join(__dirname, '../public/src')
    }
  }
});

// Serve assets directory
server.route({
  method: 'GET',
  path: '/assets/{param*}',
  handler: (request, h) => {
    const filePath = request.params.param;
    const response = h.file(filePath);
    
    // Set correct MIME type for JavaScript files
    if (filePath.endsWith('.js')) {
      return response.type('application/javascript');
    }
    
    return response;
  },
  options: {
    files: {
      relativeTo: path.join(__dirname, '../public/assets')
    }
  }
});

// Serve other static files and React SPA
server.route({
  method: 'GET',
  path: '/{param*}',
  handler: (request, h) => {
    const requestPath = request.path;
    
    // Skip API routes
    if (requestPath.startsWith('/api/')) {
      return h.continue;
    }
    
    // For specific files, try to serve them
    if (requestPath.includes('.') && !requestPath.startsWith('/src/') && !requestPath.startsWith('/assets/')) {
      return h.file(requestPath);
    }
    
    // For all other routes (React SPA), serve index.html
    return h.file('index.html');
  },
  options: {
    files: {
      relativeTo: path.join(__dirname, '../public')
    }
  }
});

// Initialize server
const init = async () => {
  await server.register([
    Inert,
    Vision
  ]);

  await server.start();
  console.log(`Server running on port ${server.info.port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Database: ${dbConfig.type}`);
  console.log(`Server: Hapi.js`);
  console.log(`Database Connection: ${dbConfig.connectionString}`);
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

init();

module.exports = server;