import Hapi from '@hapi/hapi';
import dbService from './database.js';

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

// Test endpoint with database connection
server.route({
  method: 'GET',
  path: '/api/test',
  handler: async (request, h) => {
    try {
      const testConnection = await dbService.testConnection();
      return {
        status: 'success',
        message: 'API and database working correctly',
        timestamp: new Date().toISOString(),
        server: 'Node.js Hapi',
        environment: process.env.NODE_ENV || 'development',
        database: testConnection.database || 'connected',
        config: testConnection.config || {}
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'API working but database connection failed',
        error: error.message,
        timestamp: new Date().toISOString(),
        server: 'Node.js Hapi',
        environment: process.env.NODE_ENV || 'development'
      };
    }
  }
});

// Jobs endpoint
server.route({
  method: 'GET',
  path: '/api/jobs',
  handler: async (request, h) => {
    try {
      const jobs = await dbService.getJobs();
      return {
        jobs: jobs,
        total: jobs.length,
        status: 'success'
      };
    } catch (error) {
      console.error('Jobs endpoint error:', error);
      return h.response({
        error: error.message,
        jobs: [],
        total: 0,
        status: 'error'
      }).code(500);
    }
  }
});

// Job detail endpoint
server.route({
  method: 'GET',
  path: '/api/jobs/{id}',
  handler: async (request, h) => {
    try {
      const jobId = parseInt(request.params.id);
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

// Projects endpoint
server.route({
  method: 'GET',
  path: '/api/projects',
  handler: async (request, h) => {
    try {
      const userId = request.query.userId;
      const userType = request.query.userType || 'freelancer';
      
      if (!userId) {
        return h.response({
          error: 'User ID is required',
          status: 'error'
        }).code(400);
      }
      
      const projects = await dbService.getUserProjects(userId, userType);
      return {
        projects: projects,
        total: projects.length,
        status: 'success'
      };
    } catch (error) {
      console.error('Projects endpoint error:', error);
      return h.response({
        error: error.message,
        projects: [],
        total: 0,
        status: 'error'
      }).code(500);
    }
  }
});

// Proposals endpoint
server.route({
  method: 'GET',
  path: '/api/proposals',
  handler: async (request, h) => {
    try {
      const userId = request.query.userId;
      
      if (!userId) {
        return h.response({
          error: 'User ID is required',
          status: 'error'
        }).code(400);
      }
      
      const proposals = await dbService.getUserProposals(userId);
      return {
        proposals: proposals,
        total: proposals.length,
        status: 'success'
      };
    } catch (error) {
      console.error('Proposals endpoint error:', error);
      return h.response({
        error: error.message,
        proposals: [],
        total: 0,
        status: 'error'
      }).code(500);
    }
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