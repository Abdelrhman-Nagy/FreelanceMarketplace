import Hapi from '@hapi/hapi';
import Inert from '@hapi/inert';
import Vision from '@hapi/vision';
import path from 'path';
import { fileURLToPath } from 'url';
import dbService from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Hapi server
const server = Hapi.server({
  port: process.env.PORT || process.env.IISNODE_PORT || 5000,
  host: process.env.HOST || '0.0.0.0',
  routes: {
    cors: {
      origin: ['*'],
      headers: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'x-user-id', 'x-user-type'],
      additionalHeaders: ['cache-control', 'x-requested-with']
    },
    files: {
      relativeTo: path.join(__dirname, '../public')
    }
  }
});

// Test endpoint
server.route({
  method: 'GET',
  path: '/api/test',
  handler: async (request, h) => {
    try {
      const testConnection = await dbService.testConnection();
      return {
        status: 'success',
        message: 'API is working correctly',
        timestamp: new Date().toISOString(),
        server: 'Node.js Hapi',
        database: testConnection.database || 'connected',
        config: testConnection.config || {}
      };
    } catch (error) {
      console.error('Test endpoint error:', error);
      return h.response({
        status: 'error',
        message: 'Database connection failed',
        error: error.message,
        timestamp: new Date().toISOString(),
        server: 'Node.js Hapi'
      }).code(500);
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

// User stats endpoint
server.route({
  method: 'GET',
  path: '/api/users/{userId}/stats',
  handler: async (request, h) => {
    try {
      const userId = request.params.userId;
      const stats = await dbService.getUserStats(userId);
      return {
        stats: stats,
        status: 'success'
      };
    } catch (error) {
      console.error('User stats endpoint error:', error);
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

// Project detail endpoint
server.route({
  method: 'GET',
  path: '/api/projects/{id}',
  handler: async (request, h) => {
    try {
      const projectId = parseInt(request.params.id);
      const project = await dbService.getProjectById(projectId);
      
      if (!project) {
        return h.response({
          error: 'Project not found',
          status: 'error'
        }).code(404);
      }
      
      return {
        project: project,
        status: 'success'
      };
    } catch (error) {
      console.error('Project detail endpoint error:', error);
      return h.response({
        error: error.message,
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

// Job proposals endpoint
server.route({
  method: 'GET',
  path: '/api/jobs/{jobId}/proposals',
  handler: async (request, h) => {
    try {
      const jobId = parseInt(request.params.jobId);
      const proposals = await dbService.getJobProposals(jobId);
      return {
        proposals: proposals,
        total: proposals.length,
        status: 'success'
      };
    } catch (error) {
      console.error('Job proposals endpoint error:', error);
      return h.response({
        error: error.message,
        proposals: [],
        total: 0,
        status: 'error'
      }).code(500);
    }
  }
});

// Start server
const init = async () => {
  try {
    // Register plugins first
    await server.register(Inert);
    
    // Add static file route after plugin registration
    server.route({
      method: 'GET',
      path: '/{param*}',
      handler: {
        directory: {
          path: '.',
          redirectToSlash: true,
          index: true
        }
      }
    });
    
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