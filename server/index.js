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

// Project management routes
server.route({
  method: 'GET',
  path: '/api/projects',
  handler: async (request, h) => {
    try {
      const projects = await dbService.getProjects();
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

server.route({
  method: 'GET',
  path: '/api/projects/{id}/tasks',
  handler: async (request, h) => {
    try {
      const projectId = parseInt(request.params.id);
      const tasks = await dbService.getProjectTasks(projectId);
      
      return {
        tasks: tasks,
        total: tasks.length,
        status: 'success'
      };
    } catch (error) {
      console.error('Project tasks endpoint error:', error);
      return h.response({
        error: error.message,
        tasks: [],
        total: 0,
        status: 'error'
      }).code(500);
    }
  }
});

server.route({
  method: 'GET',
  path: '/api/projects/{id}/messages',
  handler: async (request, h) => {
    try {
      const projectId = parseInt(request.params.id);
      const messages = await dbService.getProjectMessages(projectId);
      
      return {
        messages: messages,
        total: messages.length,
        status: 'success'
      };
    } catch (error) {
      console.error('Project messages endpoint error:', error);
      return h.response({
        error: error.message,
        messages: [],
        total: 0,
        status: 'error'
      }).code(500);
    }
  }
});

server.route({
  method: 'POST',
  path: '/api/projects/{id}/messages',
  handler: async (request, h) => {
    try {
      const projectId = parseInt(request.params.id);
      const { senderId, message, messageType = 'text' } = request.payload;
      
      const newMessage = await dbService.createProjectMessage({
        projectId,
        senderId,
        message,
        messageType
      });
      
      return {
        message: newMessage,
        status: 'success'
      };
    } catch (error) {
      console.error('Create message endpoint error:', error);
      return h.response({
        error: error.message,
        status: 'error'
      }).code(500);
    }
  }
});

server.route({
  method: 'POST',
  path: '/api/projects/{id}/tasks',
  handler: async (request, h) => {
    try {
      const projectId = parseInt(request.params.id);
      const taskData = { ...request.payload, projectId };
      
      const newTask = await dbService.createTask(taskData);
      
      return {
        task: newTask,
        status: 'success'
      };
    } catch (error) {
      console.error('Create task endpoint error:', error);
      return h.response({
        error: error.message,
        status: 'error'
      }).code(500);
    }
  }
});

server.route({
  method: 'PATCH',
  path: '/api/tasks/{id}',
  handler: async (request, h) => {
    try {
      const taskId = parseInt(request.params.id);
      const updates = request.payload;
      
      const updatedTask = await dbService.updateTask(taskId, updates);
      
      return {
        task: updatedTask,
        status: 'success'
      };
    } catch (error) {
      console.error('Update task endpoint error:', error);
      return h.response({
        error: error.message,
        status: 'error'
      }).code(500);
    }
  }
});

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
      database: 'postgresql',
      config: {
        host: process.env.PGHOST,
        database: process.env.PGDATABASE,
        port: process.env.PGPORT,
        user: process.env.PGUSER
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
      database: 'postgresql',
      connection: {
        host: process.env.PGHOST,
        database: process.env.PGDATABASE,
        port: process.env.PGPORT,
        user: process.env.PGUSER,
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