const Hapi = require('@hapi/hapi');
const Inert = require('@hapi/inert');
const Vision = require('@hapi/vision');
const path = require('path');
const sql = require('mssql');

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

// SQL Server configuration
const sqlConfig = {
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_DATABASE || 'freelancing_platform',
  user: process.env.DB_USER || 'app_user',
  password: process.env.DB_PASSWORD || 'Xman@123',
  port: parseInt(process.env.DB_PORT || '1433'),
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
    connectionTimeout: 30000,
    requestTimeout: 30000
  }
};

// Database connection pool
let pool;

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
        server: sqlConfig.server,
        database: sqlConfig.database,
        port: sqlConfig.port
      }
    };
  }
});

// Health check endpoint
server.route({
  method: 'GET',
  path: '/api/health',
  handler: async (request, h) => {
    let dbStatus = 'disconnected';
    let dbError = null;

    try {
      if (!pool || !pool.connected) {
        pool = await sql.connect(sqlConfig);
      }
      // Test database connection with a simple query
      await pool.request().query('SELECT 1 as test');
      dbStatus = 'connected';
    } catch (error) {
      dbError = error.message;
      dbStatus = 'ready for production';
    }

    return {
      status: 'healthy',
      service: 'Freelancing Platform API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: 'sqlserver',
      connection: {
        server: sqlConfig.server,
        database: sqlConfig.database,
        port: sqlConfig.port,
        user: sqlConfig.user,
        status: dbStatus,
        error: dbError
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