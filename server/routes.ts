import { ServerRoute } from '@hapi/hapi';
import { storage } from './storage.js';
import { insertUserSchema, insertJobSchema, insertProposalSchema } from '../shared/schema.js';

export const routes: ServerRoute[] = [
  // Authentication routes
  {
    method: 'POST',
    path: '/api/auth/register',
    handler: async (request, h) => {
      try {
        const validatedData = insertUserSchema.parse(request.payload);
        
        // Check if user already exists
        const existingUser = await storage.getUserByEmail(validatedData.email);
        if (existingUser) {
          return h.response({ error: 'User already exists' }).code(400);
        }

        const user = await storage.createUser(validatedData);
        return { user, status: 'success' };
      } catch (error) {
        console.error('Registration error:', error);
        return h.response({ error: 'Registration failed' }).code(500);
      }
    },
  },
  
  {
    method: 'POST',
    path: '/api/auth/login',
    handler: async (request, h) => {
      try {
        const { email } = request.payload as { email: string; password: string };
        
        const user = await storage.getUserByEmail(email);
        if (!user) {
          return h.response({ error: 'Invalid credentials' }).code(401);
        }

        return { user, status: 'success' };
      } catch (error) {
        console.error('Login error:', error);
        return h.response({ error: 'Login failed' }).code(500);
      }
    },
  },

  {
    method: 'PATCH',
    path: '/api/auth/profile',
    handler: async (request, h) => {
      try {
        const { userId, ...updateData } = request.payload as any;
        
        const user = await storage.updateUser(userId, updateData);
        if (!user) {
          return h.response({ error: 'User not found' }).code(404);
        }

        return { user, status: 'success' };
      } catch (error) {
        console.error('Profile update error:', error);
        return h.response({ error: 'Profile update failed' }).code(500);
      }
    },
  },

  // Job routes
  {
    method: 'GET',
    path: '/api/jobs',
    handler: async (request, h) => {
      try {
        const jobs = await storage.getJobs();
        return {
          jobs,
          total: jobs.length,
          status: 'success',
          database: 'Connected to PostgreSQL'
        };
      } catch (error) {
        console.error('Jobs fetch error:', error);
        return h.response({
          error: error.message,
          jobs: [],
          total: 0,
          status: 'error',
          database: 'PostgreSQL connection failed'
        }).code(500);
      }
    },
  },

  {
    method: 'GET',
    path: '/api/jobs/{id}',
    handler: async (request, h) => {
      try {
        const jobId = parseInt(request.params.id);
        const job = await storage.getJobById(jobId);
        
        if (!job) {
          return h.response({ error: 'Job not found' }).code(404);
        }

        return { job, status: 'success' };
      } catch (error) {
        console.error('Job fetch error:', error);
        return h.response({ error: 'Job fetch failed' }).code(500);
      }
    },
  },

  {
    method: 'POST',
    path: '/api/jobs',
    handler: async (request, h) => {
      try {
        const validatedData = insertJobSchema.parse(request.payload);
        const job = await storage.createJob(validatedData);
        return { job, status: 'success' };
      } catch (error) {
        console.error('Job creation error:', error);
        return h.response({ error: 'Job creation failed' }).code(500);
      }
    },
  },

  // User stats route
  {
    method: 'GET',
    path: '/api/my-stats',
    handler: async (request, h) => {
      try {
        // In a real app, get userId from authentication
        const userId = 'freelancer_001';
        
        const user = await storage.getUser(userId);
        if (!user) {
          return h.response({ error: 'User not found' }).code(404);
        }

        // Get user's proposals if freelancer, jobs if client
        let stats;
        if (user.userType === 'freelancer') {
          const proposals = await storage.getProposalsByFreelancerId(userId);
          stats = {
            totalJobs: proposals.length,
            activeProposals: proposals.filter(p => p.status === 'pending').length,
            completedContracts: proposals.filter(p => p.status === 'accepted').length,
            totalEarnings: 12500,
            rating: user.rating || 0
          };
        } else {
          const userJobs = await storage.getJobs();
          const clientJobs = userJobs.filter(job => job.clientId === userId);
          stats = {
            totalJobs: clientJobs.length,
            activeJobs: clientJobs.filter(job => job.status === 'active').length,
            totalSpent: 8500,
            activeContracts: 2,
            rating: user.rating || 0
          };
        }

        return { ...stats, status: 'success' };
      } catch (error) {
        console.error('Stats fetch error:', error);
        return h.response({ error: 'Stats fetch failed' }).code(500);
      }
    },
  },

  // Health check
  {
    method: 'GET',
    path: '/api/health',
    handler: async (request, h) => {
      const dbTest = await storage.getUser('test');
      
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
          status: 'connected',
          error: null
        }
      };
    },
  },

  // Test API route
  {
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
  },
];