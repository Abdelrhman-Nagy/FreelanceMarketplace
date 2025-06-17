import Hapi from '@hapi/hapi';
import Inert from '@hapi/inert';
import Vision from '@hapi/vision';
import path from 'path';
import { fileURLToPath } from 'url';
import { neon } from '@neondatabase/serverless';

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
  type: 'sqlserver',
  connectionString: process.env.DATABASE_URL || 'Server=localhost;Database=freelancing_platform;User Id=app_user;Password=Xman@123;Encrypt=true;TrustServerCertificate=true;',
  server: process.env.DB_SERVER || 'localhost',
  user: process.env.DB_USER || 'app_user',
  password: process.env.DB_PASSWORD || 'Xman@123',
  database: process.env.DB_DATABASE || 'freelancing_platform',
  port: parseInt(process.env.DB_PORT || '1433'),
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
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
        server: dbConfig.server,
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
      const sql = neon(process.env.DATABASE_URL);
      
      const jobs = await sql`
        SELECT 
          id,
          title,
          description,
          client_id,
          category,
          budget_type,
          budget_min,
          budget_max,
          hourly_rate,
          experience_level,
          skills,
          status,
          remote,
          proposal_count,
          created_at,
          updated_at
        FROM jobs 
        WHERE status = 'active'
        ORDER BY created_at DESC
      `;

      // Process and format the jobs data
      const formattedJobs = jobs.map(job => {
        // Handle skills array conversion
        let skillsArray = [];
        if (job.skills) {
          if (Array.isArray(job.skills)) {
            skillsArray = job.skills;
          } else if (typeof job.skills === 'string') {
            try {
              skillsArray = JSON.parse(job.skills);
            } catch (e) {
              skillsArray = job.skills.split(',').map(s => s.trim());
            }
          }
        }

        // Calculate budget display
        let budget = 0;
        if (job.budget_type === 'fixed') {
          budget = job.budget_max || job.budget_min || 0;
        } else if (job.budget_type === 'hourly') {
          budget = job.hourly_rate || 0;
        }

        return {
          id: job.id,
          title: job.title,
          description: job.description,
          budget: budget,
          category: job.category,
          skills: skillsArray,
          experienceLevel: job.experience_level,
          clientId: job.client_id,
          status: job.status,
          createdAt: job.created_at,
          budgetType: job.budget_type,
          remote: job.remote,
          proposalCount: job.proposal_count || 0
        };
      });

      return {
        jobs: formattedJobs,
        total: formattedJobs.length,
        status: "success",
        database: "Connected to PostgreSQL"
      };
    } catch (error) {
      console.error('Jobs endpoint error:', error);
      return h.response({
        error: (error as Error).message,
        jobs: [],
        total: 0,
        status: "error",
        database: "Database connection failed"
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
        server: dbConfig.server,
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

// Initialize server
const init = async () => {
  await server.register([
    Inert,
    Vision
  ]);

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

  await server.start();
  console.log(`Server running on port ${server.info.port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Server: Hapi.js`);
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

init();