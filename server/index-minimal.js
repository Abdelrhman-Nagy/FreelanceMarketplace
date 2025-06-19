import Hapi from '@hapi/hapi';

// Initialize Hapi server
const server = Hapi.server({
  port: process.env.PORT || process.env.IISNODE_PORT || 5000,
  host: process.env.HOST || '0.0.0.0',
  routes: {
    cors: {
      origin: ['*'],
      headers: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept'],
      additionalHeaders: ['cache-control', 'x-requested-with']
    }
  }
});

// Simple test endpoint
server.route({
  method: 'GET',
  path: '/api/test',
  handler: async (request, h) => {
    return {
      status: 'success',
      message: 'API is working correctly',
      timestamp: new Date().toISOString(),
      server: 'Node.js Hapi',
      environment: process.env.NODE_ENV || 'development'
    };
  }
});

// Root endpoint
server.route({
  method: 'GET',
  path: '/',
  handler: async (request, h) => {
    return {
      message: 'FreelancingPlatform API',
      status: 'running',
      timestamp: new Date().toISOString()
    };
  }
});

// Start server
const init = async () => {
  try {
    await server.start();
    console.log('Server running on port', server.info.port);
    console.log('Environment:', process.env.NODE_ENV || 'development');
    console.log('Server:', 'Hapi.js');
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
};

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
  process.exit(1);
});

init();