import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';
import dbService from './database.js';
import authService from './auth.js';
import { 
  sessionConfig, 
  requireSessionAuth, 
  handleLogin, 
  handleLogout, 
  handleProfile 
} from './session-auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || process.env.IISNODE_PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

// Session middleware
app.use(sessionConfig);

// Simple CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/api/test', async (req, res) => {
  try {
    const testConnection = await dbService.testConnection();
    res.json({
      status: 'success',
      message: 'API is working correctly',
      timestamp: new Date().toISOString(),
      server: 'Node.js Express',
      environment: process.env.NODE_ENV || 'development',
      database: testConnection.status,
      config: testConnection.config || {}
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'API working but database connection failed',
      error: error.message,
      timestamp: new Date().toISOString(),
      server: 'Node.js Express',
      environment: process.env.NODE_ENV || 'development'
    });
  }
});

// Jobs endpoints
app.get('/api/jobs', async (req, res) => {
  try {
    console.log('Jobs endpoint called');
    const jobs = await dbService.getJobs();
    console.log('Jobs retrieved, count:', jobs.length);
    
    res.json({
      jobs: jobs,
      total: jobs.length,
      status: 'success',
      database: 'Connected to PostgreSQL'
    });
  } catch (error) {
    console.error('Jobs endpoint error:', error);
    console.error('Error stack:', error.stack);
    res.json({
      error: error.message,
      jobs: [],
      total: 0,
      status: 'error',
      database: 'Error occurred'
    });
  }
});

app.post('/api/jobs', async (req, res) => {
  try {
    if (!req.session?.user && !req.session?.userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const userId = req.session.userId || req.session.user?.id;
    const userType = req.session.user?.userType || req.session.user?.role;

    if (userType !== 'client') {
      return res.status(403).json({
        status: 'error',
        message: 'Only clients can post jobs'
      });
    }

    const { 
      title, 
      description, 
      category, 
      budgetType, 
      budgetMin, 
      budgetMax, 
      experienceLevel, 
      skills, 
      duration 
    } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({
        status: 'error',
        message: 'Title, description, and category are required'
      });
    }

    const jobData = {
      title,
      description,
      clientId: userId,
      category,
      budgetType: budgetType || 'fixed',
      budgetMin: budgetMin ? parseInt(budgetMin) : null,
      budgetMax: budgetMax ? parseInt(budgetMax) : null,
      experienceLevel: experienceLevel || 'Intermediate',
      skills: Array.isArray(skills) ? JSON.stringify(skills) : skills,
      duration,
      status: 'active',
      createdAt: new Date()
    };

    const newJob = await dbService.createJob(jobData);

    res.json({
      status: 'success',
      message: 'Job posted successfully',
      job: newJob
    });

  } catch (error) {
    console.error('Job creation error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create job'
    });
  }
});

// Job detail endpoint
app.get('/api/jobs/:id', async (req, res) => {
  try {
    const jobId = parseInt(req.params.id);
    const job = await dbService.getJobById(jobId);
    
    if (!job) {
      return res.status(404).json({
        error: 'Job not found',
        status: 'error'
      });
    }
    
    res.json({
      job: job,
      status: 'success'
    });
  } catch (error) {
    console.error('Job detail endpoint error:', error);
    res.json({
      error: error.message,
      status: 'error'
    });
  }
});

// Proposals endpoints
app.post('/api/proposals', async (req, res) => {
  try {
    if (!req.session?.user && !req.session?.userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const userId = req.session.userId || req.session.user?.id;
    const userType = req.session.user?.userType || req.session.user?.role;

    if (userType !== 'freelancer') {
      return res.status(403).json({
        status: 'error',
        message: 'Only freelancers can submit proposals'
      });
    }

    const { jobId, coverLetter, proposedRate, estimatedDuration } = req.body;

    if (!jobId || !coverLetter) {
      return res.status(400).json({
        status: 'error',
        message: 'Job ID and cover letter are required'
      });
    }

    const proposalData = {
      freelancerId: userId,
      jobId: parseInt(jobId),
      coverLetter,
      proposedRate: proposedRate ? parseInt(proposedRate) : null,
      estimatedDuration,
      status: 'pending',
      createdAt: new Date()
    };

    const newProposal = await dbService.createProposal(proposalData);

    res.json({
      status: 'success',
      message: 'Proposal submitted successfully',
      proposal: newProposal
    });

  } catch (error) {
    console.error('Proposal creation error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to submit proposal'
    });
  }
});

app.get('/api/proposals/user', async (req, res) => {
  try {
    if (!req.session?.user && !req.session?.userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const userId = req.session.userId || req.session.user?.id;
    const proposals = await dbService.getUserProposals(userId);

    res.json({
      status: 'success',
      proposals: proposals
    });

  } catch (error) {
    console.error('Error fetching user proposals:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch proposals'
    });
  }
});

app.get('/api/jobs/:id/proposals', async (req, res) => {
  try {
    if (!req.session?.user && !req.session?.userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const jobId = parseInt(req.params.id);
    const proposals = await dbService.getJobProposals(jobId);

    res.json({
      status: 'success',
      proposals: proposals
    });

  } catch (error) {
    console.error('Error fetching job proposals:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch proposals'
    });
  }
});

// Saved jobs endpoints
app.post('/api/saved-jobs', async (req, res) => {
  try {
    if (!req.session?.user && !req.session?.userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const userId = req.session.userId || req.session.user?.id;
    const { jobId } = req.body;

    if (!jobId) {
      return res.status(400).json({
        status: 'error',
        message: 'Job ID is required'
      });
    }

    await dbService.saveJob(userId, parseInt(jobId));

    res.json({
      status: 'success',
      message: 'Job saved successfully'
    });

  } catch (error) {
    console.error('Error saving job:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to save job'
    });
  }
});

app.get('/api/saved-jobs', async (req, res) => {
  try {
    if (!req.session?.user && !req.session?.userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const userId = req.session.userId || req.session.user?.id;
    const savedJobs = await dbService.getSavedJobs(userId);

    res.json({
      status: 'success',
      savedJobs: savedJobs
    });

  } catch (error) {
    console.error('Error fetching saved jobs:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch saved jobs'
    });
  }
});

// Projects endpoint
app.get('/api/projects', async (req, res) => {
  try {
    const userId = req.query.userId || 'freelancer_001';
    const userType = req.query.userType || 'freelancer';
    
    const projects = await dbService.getUserProjects(userId, userType);
    res.json({
      projects: projects,
      total: projects.length,
      status: 'success'
    });
  } catch (error) {
    console.error('Projects endpoint error:', error);
    res.json({
      error: error.message,
      projects: [],
      total: 0,
      status: 'error'
    });
  }
});

// Proposals endpoint
app.get('/api/proposals', async (req, res) => {
  try {
    const userId = req.query.userId || 'freelancer_001';
    
    const proposals = await dbService.getUserProposals(userId);
    res.json({
      proposals: proposals,
      total: proposals.length,
      status: 'success'
    });
  } catch (error) {
    console.error('Proposals endpoint error:', error);
    res.json({
      error: error.message,
      proposals: [],
      total: 0,
      status: 'error'
    });
  }
});

// Serve static files from dist directory
app.use(express.static('dist'));

// API root endpoint for health check
app.get('/api', (req, res) => {
  res.json({
    message: 'FreelancingPlatform API',
    status: 'running',
    timestamp: new Date().toISOString(),
    server: 'Express.js',
    endpoints: [
      'GET /api/test',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'POST /api/auth/logout',
      'GET /api/auth/profile',
      'GET /api/jobs',
      'GET /api/jobs/:id',
      'GET /api/projects',
      'GET /api/proposals',
      'GET /api/admin/users',
      'GET /api/admin/stats'
    ]
  });
});

// Authentication Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, company, title, bio, skills, hourlyRate, location, experience } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        status: 'error',
        message: 'Email, password, first name, and last name are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        status: 'error',
        message: 'Password must be at least 6 characters long'
      });
    }

    const existingUser = await dbService.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        status: 'error',
        message: 'User with this email already exists'
      });
    }

    // Hash the password
    const passwordHash = await authService.hashPassword(password);

    const userData = {
      id: crypto.randomUUID(),
      email,
      passwordHash,
      firstName,
      lastName,
      userType: role || 'freelancer',
      company,
      title,
      bio,
      skills: skills || [],
      hourlyRate,
      location,
      experience
    };

    const user = await dbService.createUser(userData);
    const session = await authService.createSession(user.id);
    const token = authService.generateToken(user);

    res.cookie('authToken', session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.user_type,
        company: user.company,
        title: user.title
      },
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Registration failed'
    });
  }
});

app.post('/api/auth/login', handleLogin);

app.post('/api/auth/logout', handleLogout);

app.get('/api/auth/profile', handleProfile);

app.get('/api/auth/statistics', async (req, res) => {
  try {
    if (!req.session?.user && !req.session?.userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const userId = req.session.userId || req.session.user?.id;
    const userType = req.session.user?.userType || req.session.user?.role;

    if (!userType) {
      return res.status(400).json({
        status: 'error',
        message: 'User type not found'
      });
    }

    const statistics = await dbService.getUserStatistics(userId, userType);
    
    // Get user creation date for member since
    const user = await dbService.getUserById(userId);
    const memberSince = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    }) : 'Unknown';

    res.json({
      status: 'success',
      statistics: {
        ...statistics,
        memberSince,
        userType
      }
    });

  } catch (error) {
    console.error('Statistics fetch error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch statistics'
    });
  }
});

app.put('/api/auth/profile', async (req, res) => {
  try {
    if (!req.session?.user && !req.session?.userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const userId = req.session.userId || req.session.user?.id;
    const { 
      firstName, 
      lastName, 
      company, 
      bio, 
      skills, 
      hourlyRate, 
      location, 
      phoneNumber, 
      website, 
      experience 
    } = req.body;

    const updates = {
      firstName,
      lastName,
      company,
      bio,
      skills,
      hourlyRate,
      location,
      phoneNumber,
      website,
      experience,
      updatedAt: new Date()
    };

    // Remove undefined values
    Object.keys(updates).forEach(key => {
      if (updates[key] === undefined) {
        delete updates[key];
      }
    });

    const updatedUser = await dbService.updateUser(userId, updates);

    // Update session with new data including contact information
    const userData = {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      userType: updatedUser.userType,
      role: updatedUser.userType,
      company: updatedUser.company,
      title: updatedUser.title,
      bio: updatedUser.bio,
      skills: updatedUser.skills ? (typeof updatedUser.skills === 'string' ? JSON.parse(updatedUser.skills) : updatedUser.skills) : [],
      hourlyRate: updatedUser.hourlyRate,
      location: updatedUser.location,
      phoneNumber: updatedUser.phoneNumber,
      website: updatedUser.website,
      rating: updatedUser.rating || 0,
      totalJobs: updatedUser.totalJobs || 0,
      completedJobs: updatedUser.completedJobs || 0,
      totalEarnings: updatedUser.totalEarnings || 0,
      createdAt: updatedUser.createdAt
    };

    req.session.user = userData;

    res.json({
      status: 'success',
      message: 'Profile updated successfully',
      user: userData
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update profile'
    });
  }
});

app.get('/api/admin/users', authService.requireRole(['admin']), async (req, res) => {
  try {
    const { role, status, limit } = req.query;
    const filters = { role, status, limit: limit ? parseInt(limit) : null };
    
    const users = await dbService.getAllUsers(filters);
    
    res.json({
      status: 'success',
      users,
      total: users.length
    });

  } catch (error) {
    console.error('Admin users fetch error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch users'
    });
  }
});

app.get('/api/admin/stats', authService.requireRole(['admin']), async (req, res) => {
  try {
    const userStats = await dbService.getUserStats();
    const jobStats = await dbService.getJobs();
    const proposalStats = await dbService.getAllProposals();
    
    const stats = {
      users: {
        total: userStats.reduce((sum, stat) => sum + parseInt(stat.count), 0),
        byRole: userStats.reduce((acc, stat) => {
          if (!acc[stat.role]) acc[stat.role] = {};
          acc[stat.role][stat.status] = parseInt(stat.count);
          return acc;
        }, {})
      },
      jobs: {
        total: jobStats.length,
        active: jobStats.filter(job => job.status === 'active').length
      },
      proposals: {
        total: proposalStats.length
      }
    };

    res.json({
      status: 'success',
      stats
    });

  } catch (error) {
    console.error('Admin stats fetch error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch statistics'
    });
  }
});

app.get('/api/dashboard/:role', requireSessionAuth, async (req, res) => {
  try {
    const { role } = req.params;
    const user = req.user;

    if (user.user_type !== role && user.user_type !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }

    let dashboardData = {};

    switch (role) {
      case 'admin':
        const userStats = await dbService.getUserStats();
        const allJobs = await dbService.getJobs();
        const allProposals = await dbService.getAllProposals();
        
        dashboardData = {
          stats: {
            totalUsers: userStats.reduce((sum, stat) => sum + parseInt(stat.count), 0),
            totalJobs: allJobs.length,
            totalProposals: allProposals.length,
            activeJobs: allJobs.filter(job => job.status === 'active').length
          },
          recentUsers: await dbService.getAllUsers({ limit: 5 }),
          recentJobs: allJobs.slice(0, 5)
        };
        break;

      case 'client':
        const clientJobs = await dbService.getJobs();
        const clientProjects = await dbService.getUserProjects(user.id, 'client');
        
        dashboardData = {
          stats: {
            postedJobs: clientJobs.length,
            activeProjects: clientProjects.filter(p => p.status === 'active').length,
            totalSpent: user.total_earnings || 0
          },
          recentJobs: clientJobs.slice(0, 5),
          activeProjects: clientProjects.slice(0, 5)
        };
        break;

      case 'freelancer':
        const freelancerProposals = await dbService.getUserProposals(user.id);
        const freelancerProjects = await dbService.getUserProjects(user.id, 'freelancer');
        const savedJobs = await dbService.getSavedJobs(user.id);
        
        dashboardData = {
          stats: {
            submittedProposals: freelancerProposals.length,
            activeProjects: freelancerProjects.filter(p => p.status === 'active').length,
            totalEarnings: user.total_earnings || 0,
            savedJobs: savedJobs.length
          },
          recentProposals: freelancerProposals.slice(0, 5),
          activeProjects: freelancerProjects.slice(0, 5),
          recommendedJobs: await dbService.getJobs()
        };
        break;

      default:
        return res.status(400).json({
          status: 'error',
          message: 'Invalid role'
        });
    }

    res.json({
      status: 'success',
      role,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role
      },
      dashboard: dashboardData
    });

  } catch (error) {
    console.error('Dashboard fetch error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch dashboard data'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Serve React app for specific routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.get('/jobs', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.get('/jobs/:id', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.get('/contracts', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.get('/post-job', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.get('/projects', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.get('/projects/:id', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.get('/saved-jobs', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.get('/proposals', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// 404 handler
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    res.status(404).json({
      status: 'error',
      message: 'API endpoint not found',
      path: req.path
    });
  } else {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  }
});

// Start server
const server = app.listen(PORT, HOST, () => {
  console.log(`Server running on ${HOST}:${PORT}`);
  console.log('Environment:', process.env.NODE_ENV || 'development');
  console.log('Server:', 'Express.js');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
  process.exit(1);
});

export default app;