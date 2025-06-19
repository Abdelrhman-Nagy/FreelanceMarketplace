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

// Test endpoint
server.route({
  method: 'GET',
  path: '/api/test',
  handler: async (request, h) => {
    return h.response({
      status: 'success',
      message: 'API is working correctly',
      timestamp: new Date().toISOString(),
      server: 'Node.js Hapi',
      environment: process.env.NODE_ENV || 'development',
      database: 'simulated'
    }).code(200);
  }
});

// Simple jobs endpoint with mock data
server.route({
  method: 'GET',
  path: '/api/jobs',
  handler: async (request, h) => {
    const mockJobs = [
      {
        id: 1,
        title: 'React Developer Needed',
        description: 'Build a modern web application',
        budget: 5000,
        category: 'Web Development'
      },
      {
        id: 2,
        title: 'Mobile App Designer',
        description: 'Design UI/UX for mobile app',
        budget: 3000,
        category: 'Design'
      }
    ];

    return h.response({
      jobs: mockJobs,
      total: mockJobs.length,
      status: 'success'
    }).code(200);
  }
});

// Simple projects endpoint
server.route({
  method: 'GET',
  path: '/api/projects',
  handler: async (request, h) => {
    const mockProjects = [
      {
        id: 1,
        title: 'E-commerce Website',
        status: 'in_progress',
        deadline: '2025-08-15'
      }
    ];

    return h.response({
      projects: mockProjects,
      total: mockProjects.length,
      status: 'success'
    }).code(200);
  }
});

// Root endpoint
server.route({
  method: 'GET',
  path: '/',
  handler: async (request, h) => {
    return h.response({
      message: 'FreelancingPlatform API',
      status: 'running',
      timestamp: new Date().toISOString(),
      endpoints: [
        'GET /api/test',
        'GET /api/jobs',
        'GET /api/projects'
      ]
    }).code(200);
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