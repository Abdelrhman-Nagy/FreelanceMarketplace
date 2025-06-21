import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';
import dbService from './database.js';
import authService from './auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || process.env.IISNODE_PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

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

// Jobs endpoint
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

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email and password are required'
      });
    }

    const user = await dbService.getUserByEmail(email);
    
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    // Verify password
    const isPasswordValid = await authService.verifyPassword(password, user.password_hash);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    // Update last login time
    await dbService.updateUserLoginTime(user.id);

    // Store user data in session
    req.session.userId = user.id;
    req.session.user = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.user_type,
      company: user.company,
      bio: user.bio,
      skills: user.skills ? (typeof user.skills === 'string' ? JSON.parse(user.skills) : user.skills) : [],
      hourlyRate: user.hourly_rate,
      location: user.location
    };

    res.json({
      status: 'success',
      message: 'Login successful',
      user: req.session.user
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Login failed'
    });
  }
});

app.post('/api/auth/logout', async (req, res) => {
  try {
    // Destroy the session
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destroy error:', err);
        return res.status(500).json({
          status: 'error',
          message: 'Logout failed'
        });
      }

      // Clear the session cookie
      res.clearCookie('connect.sid');
      res.json({
        status: 'success',
        message: 'Logout successful'
      });
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Logout failed'
    });
  }
});

app.get('/api/auth/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.authToken;

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const validation = await authService.validateSession(token);
    if (!validation) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid or expired session'
      });
    }

    const { user } = validation;
    
    res.json({
      status: 'success',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        company: user.company,
        title: user.title,
        bio: user.bio,
        skills: user.skills,
        hourlyRate: user.hourly_rate,
        location: user.location,
        timezone: user.timezone,
        phoneNumber: user.phone_number,
        website: user.website,
        portfolio: user.portfolio,
        experience: user.experience,
        rating: user.rating,
        totalJobs: user.total_jobs,
        completedJobs: user.completed_jobs,
        totalEarnings: user.total_earnings,
        lastLoginAt: user.last_login_at,
        createdAt: user.created_at
      }
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch profile'
    });
  }
});

app.put('/api/auth/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.authToken;

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const validation = await authService.validateSession(token);
    if (!validation) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid or expired session'
      });
    }

    const { user } = validation;
    const updateData = req.body;

    delete updateData.id;
    delete updateData.email;
    delete updateData.role;
    delete updateData.status;
    delete updateData.created_at;
    delete updateData.updated_at;

    const updatedUser = await dbService.updateUser(user.id, updateData);

    res.json({
      status: 'success',
      message: 'Profile updated successfully',
      user: updatedUser
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

// Middleware to check authentication
const requireAuth = async (req, res, next) => {
  try {
    // Check if user is logged in via session
    if (!req.session.userId || !req.session.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    // Optionally verify user still exists in database
    const user = await dbService.getUserById(req.session.userId);
    if (!user) {
      // Clear invalid session
      req.session.destroy(() => {});
      return res.status(401).json({
        status: 'error',
        message: 'User not found'
      });
    }

    req.user = user;
    req.sessionUser = req.session.user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      status: 'error',
      message: 'Authentication failed'
    });
  }
};

app.get('/api/dashboard/:role', requireAuth, async (req, res) => {
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