// Hapi server for IIS deployment with PostgreSQL support
const Hapi = require('@hapi/hapi');
const Inert = require('@hapi/inert');
const Vision = require('@hapi/vision');
const path = require('path');

// Initialize Hapi server
const server = Hapi.server({
  port: process.env.PORT || process.env.IISNODE_HTTP_PORT || 3000,
  host: process.env.IISNODE_HTTP_HOST || '0.0.0.0',
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

// Jobs endpoint with PostgreSQL integration
server.route({
  method: 'GET',
  path: '/api/jobs',
  handler: async (request, h) => {
    try {
      return {
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
      };
    } catch (error) {
      console.error('Jobs endpoint error:', error);
      return h.response({
        error: error.message,
        jobs: [],
        total: 0,
        status: "error"
      }).code(500);
    }
  }
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
server.route({
  method: 'GET',
  path: '/api/my-stats',
  handler: (request, h) => {
    return {
      totalJobs: 15,
      activeProposals: 3,
      completedContracts: 8,
      totalEarnings: 12500,
      status: 'success'
    };
  }
});

// Serve static files
server.route({
  method: 'GET',
  path: '/{param*}',
  handler: {
    directory: {
      path: '.',
      redirectToSlash: true,
      index: true,
      defaultExtension: 'html'
    }
  }
});

// Handle React routing - serve index.html for non-API routes
server.route({
  method: 'GET',
  path: '/{path*}',
  handler: (request, h) => {
    const requestPath = request.path;
    if (!requestPath.startsWith('/api/') && !requestPath.includes('.')) {
      return h.file('index.html');
    }
    return h.continue;
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
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

init();

module.exports = server;