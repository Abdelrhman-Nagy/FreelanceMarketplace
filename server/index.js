import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';
import dbService, { 
  sessionConfig, 
  requireSessionAuth, 
  handleLogin, 
  handleLogout, 
  handleProfile 
} from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || process.env.IISNODE_PORT || 80;
const HOST = process.env.HOST || '0.0.0.0';

// Parse JSON bodies
app.use(express.json());
app.use(cookieParser());

// Session middleware
app.use(sessionConfig);

// Debug session middleware
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'development' && req.path.includes('/api/auth/')) {
    console.log('Session debug - sessionID:', req.sessionID);
    console.log('Session debug - session:', req.session);
    console.log('Session debug - cookies:', req.headers.cookie);
  }
  next();
});

// CORS middleware for session support
app.use((req, res, next) => {
  const origin = req.headers.origin || req.headers.host;
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Add request logging for debugging
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`${req.method} ${req.path}`);
    if (req.path.includes('/api/auth/')) {
      console.log('Request headers:', req.headers);
      console.log('Request body:', req.body);
    }
  }
  next();
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

// Get client's own jobs
app.get('/api/jobs/my-jobs', async (req, res) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const userId = req.session.userId;
    const userType = req.session.user?.userType || req.session.user?.role;

    if (userType !== 'client') {
      return res.status(403).json({
        status: 'error',
        message: 'Only clients can access this endpoint'
      });
    }

    const jobs = await dbService.getClientJobs(userId);
    
    res.json({
      jobs: jobs,
      total: jobs.length,
      status: 'success'
    });
  } catch (error) {
    console.error('Client jobs fetch error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch client jobs'
    });
  }
});

// Get all freelancers
app.get('/api/freelancers', async (req, res) => {
  try {
    const freelancers = await dbService.getFreelancers();
    
    res.json({
      freelancers: freelancers,
      total: freelancers.length,
      status: 'success'
    });
  } catch (error) {
    console.error('Freelancers fetch error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch freelancers'
    });
  }
});

// Get user messages/conversations
app.get('/api/messages', async (req, res) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const userId = req.session.userId;
    const conversations = await dbService.getUserConversations(userId);
    
    res.json({
      conversations: conversations,
      status: 'success'
    });
  } catch (error) {
    console.error('Messages fetch error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch messages'
    });
  }
});

// Send a message
app.post('/api/messages', async (req, res) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const { receiverId, content, jobId, proposalId } = req.body;
    
    if (!receiverId || !content) {
      return res.status(400).json({
        status: 'error',
        message: 'Receiver ID and content are required'
      });
    }

    const messageData = {
      senderId: req.session.userId,
      receiverId,
      content,
      jobId: jobId ? parseInt(jobId) : null,
      proposalId: proposalId ? parseInt(proposalId) : null,
      read: false,
      createdAt: new Date()
    };

    const newMessage = await dbService.createMessage(messageData);
    
    res.json({
      status: 'success',
      message: 'Message sent successfully',
      messageData: newMessage
    });
  } catch (error) {
    console.error('Message send error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to send message'
    });
  }
});

// Admin endpoints
app.get('/api/admin/stats', async (req, res) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const userType = req.session.user?.userType || req.session.user?.role;
    if (userType !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Admin access required'
      });
    }

    const stats = await dbService.getAdminStats();
    
    res.json({
      ...stats,
      status: 'success'
    });
  } catch (error) {
    console.error('Admin stats fetch error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch admin stats'
    });
  }
});

app.get('/api/admin/users', async (req, res) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const userType = req.session.user?.userType || req.session.user?.role;
    if (userType !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Admin access required'
      });
    }

    const users = await dbService.getAllUsers();
    
    res.json({
      users: users,
      total: users.length,
      status: 'success'
    });
  } catch (error) {
    console.error('Admin users fetch error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch users'
    });
  }
});

app.get('/api/admin/jobs', async (req, res) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const userType = req.session.user?.userType || req.session.user?.role;
    if (userType !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Admin access required'
      });
    }

    const jobs = await dbService.getAllJobsForAdmin(); // Admin sees all jobs including pending
    
    res.json({
      jobs: jobs,
      total: jobs.length,
      status: 'success'
    });
  } catch (error) {
    console.error('Admin jobs fetch error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch jobs'
    });
  }
});

// Get pending users for approval
app.get('/api/admin/users/pending', async (req, res) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const userType = req.session.user?.userType || req.session.user?.role;
    if (userType !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Admin access required'
      });
    }

    const users = await dbService.getPendingUsers();
    
    res.json({
      users: users,
      total: users.length,
      status: 'success'
    });
  } catch (error) {
    console.error('Pending users fetch error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch pending users'
    });
  }
});

// Get pending jobs for approval
app.get('/api/admin/jobs/pending', async (req, res) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const userType = req.session.user?.userType || req.session.user?.role;
    if (userType !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Admin access required'
      });
    }

    const jobs = await dbService.getPendingJobs();
    
    res.json({
      jobs: jobs,
      total: jobs.length,
      status: 'success'
    });
  } catch (error) {
    console.error('Pending jobs fetch error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch pending jobs'
    });
  }
});

// Approve a user
app.post('/api/admin/users/:userId/approve', async (req, res) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const userType = req.session.user?.userType || req.session.user?.role;
    if (userType !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Admin access required'
      });
    }

    const { userId } = req.params;
    await dbService.approveUser(userId, req.session.userId);
    
    res.json({
      status: 'success',
      message: 'User approved successfully'
    });
  } catch (error) {
    console.error('User approval error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to approve user'
    });
  }
});

// Reject a user
app.post('/api/admin/users/:userId/reject', async (req, res) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const userType = req.session.user?.userType || req.session.user?.role;
    if (userType !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Admin access required'
      });
    }

    const { userId } = req.params;
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({
        status: 'error',
        message: 'Rejection reason is required'
      });
    }

    await dbService.rejectUser(userId, req.session.userId, reason);
    
    res.json({
      status: 'success',
      message: 'User rejected successfully'
    });
  } catch (error) {
    console.error('User rejection error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to reject user'
    });
  }
});

// Approve a job
app.post('/api/admin/jobs/:jobId/approve', async (req, res) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const userType = req.session.user?.userType || req.session.user?.role;
    if (userType !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Admin access required'
      });
    }

    const { jobId } = req.params;
    await dbService.approveJob(parseInt(jobId), req.session.userId);
    
    res.json({
      status: 'success',
      message: 'Job approved successfully'
    });
  } catch (error) {
    console.error('Job approval error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to approve job'
    });
  }
});

// Reject a job
app.post('/api/admin/jobs/:jobId/reject', async (req, res) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const userType = req.session.user?.userType || req.session.user?.role;
    if (userType !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Admin access required'
      });
    }

    const { jobId } = req.params;
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({
        status: 'error',
        message: 'Rejection reason is required'
      });
    }

    await dbService.rejectJob(parseInt(jobId), req.session.userId, reason);
    
    res.json({
      status: 'success',
      message: 'Job rejected successfully'
    });
  } catch (error) {
    console.error('Job rejection error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to reject job'
    });
  }
});

app.get('/api/admin/proposals', async (req, res) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const userType = req.session.user?.userType || req.session.user?.role;
    if (userType !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Admin access required'
      });
    }

    const proposals = await dbService.getAllProposals();
    
    res.json({
      proposals: proposals,
      total: proposals.length,
      status: 'success'
    });
  } catch (error) {
    console.error('Admin proposals fetch error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch proposals'
    });
  }
});

// User moderation
app.post('/api/admin/users/:userId/suspend', async (req, res) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const userType = req.session.user?.userType || req.session.user?.role;
    if (userType !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Admin access required'
      });
    }

    const { userId } = req.params;
    await dbService.suspendUser(userId);
    
    res.json({
      status: 'success',
      message: 'User suspended successfully'
    });
  } catch (error) {
    console.error('User suspend error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to suspend user'
    });
  }
});

app.delete('/api/admin/users/:userId', async (req, res) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const userType = req.session.user?.userType || req.session.user?.role;
    if (userType !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Admin access required'
      });
    }

    const { userId } = req.params;
    await dbService.deleteUser(userId);
    
    res.json({
      status: 'success',
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('User delete error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete user'
    });
  }
});

// Job moderation
app.post('/api/admin/jobs/:jobId/suspend', async (req, res) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const userType = req.session.user?.userType || req.session.user?.role;
    if (userType !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Admin access required'
      });
    }

    const { jobId } = req.params;
    await dbService.suspendJob(parseInt(jobId));
    
    res.json({
      status: 'success',
      message: 'Job suspended successfully'
    });
  } catch (error) {
    console.error('Job suspend error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to suspend job'
    });
  }
});

app.delete('/api/admin/jobs/:jobId', async (req, res) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const userType = req.session.user?.userType || req.session.user?.role;
    if (userType !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Admin access required'
      });
    }

    const { jobId } = req.params;
    await dbService.deleteJob(parseInt(jobId));
    
    res.json({
      status: 'success',
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Job delete error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete job'
    });
  }
});

// Proposal moderation
app.post('/api/admin/proposals/:proposalId/suspend', async (req, res) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const userType = req.session.user?.userType || req.session.user?.role;
    if (userType !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Admin access required'
      });
    }

    const { proposalId } = req.params;
    await dbService.suspendProposal(parseInt(proposalId));
    
    res.json({
      status: 'success',
      message: 'Proposal suspended successfully'
    });
  } catch (error) {
    console.error('Proposal suspend error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to suspend proposal'
    });
  }
});

app.delete('/api/admin/proposals/:proposalId', async (req, res) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const userType = req.session.user?.userType || req.session.user?.role;
    if (userType !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Admin access required'
      });
    }

    const { proposalId } = req.params;
    await dbService.deleteProposal(parseInt(proposalId));
    
    res.json({
      status: 'success',
      message: 'Proposal deleted successfully'
    });
  } catch (error) {
    console.error('Proposal delete error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete proposal'
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
      approvalStatus: 'pending', // Jobs require admin approval
      createdAt: new Date()
    };

    const newJob = await dbService.createJob(jobData);

    res.json({
      status: 'success',
      message: 'Job posted successfully and is pending admin approval',
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

    console.log('Creating proposal with data:', {
      freelancerId: userId,
      jobId: parseInt(jobId),
      coverLetter,
      proposedRate: proposedRate ? parseInt(proposedRate) : null,
      estimatedDuration,
      status: 'pending',
      createdAt: new Date()
    });

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
    console.log('Proposal created successfully:', newProposal);

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

// Update proposal status with contract creation
app.patch('/api/proposals/:id/status', async (req, res) => {
  try {
    if (!req.session?.user && !req.session?.userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const proposalId = parseInt(req.params.id);
    const { status } = req.body;
    const userId = req.session.userId || req.session.user?.id;
    const userType = req.session.user?.userType || req.session.user?.role;

    if (userType !== 'client') {
      return res.status(403).json({
        status: 'error',
        message: 'Only clients can update proposal status'
      });
    }

    console.log(`Updating proposal ${proposalId} status to: ${status} by client: ${userId}`);

    const result = await dbService.updateProposalStatus(proposalId, status, userId);
    
    if (!result) {
      return res.status(404).json({
        status: 'error',
        message: 'Proposal not found or unauthorized'
      });
    }

    // If proposal is accepted, create a contract
    if (status === 'accepted') {
      try {
        const contract = await dbService.createContract({
          proposalId: proposalId,
          clientId: userId,
          freelancerId: result.freelancerId,
          jobId: result.jobId,
          proposedRate: result.proposedRate,
          estimatedDuration: result.estimatedDuration,
          status: 'active',
          startDate: new Date().toISOString()
        });
        console.log('Contract created:', contract);
        
        res.json({
          status: 'success',
          message: 'Proposal accepted and contract created successfully',
          proposal: result,
          contract: contract
        });
      } catch (contractError) {
        console.error('Error creating contract:', contractError);
        res.json({
          status: 'success',
          message: 'Proposal accepted but contract creation failed',
          proposal: result,
          contractError: contractError.message
        });
      }
    } else {
      res.json({
        status: 'success',
        message: `Proposal ${status} successfully`,
        proposal: result
      });
    }
  } catch (error) {
    console.error('Error updating proposal status:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update proposal status'
    });
  }
});

// Get contracts for user
app.get('/api/contracts', async (req, res) => {
  try {
    if (!req.session?.user && !req.session?.userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const userId = req.session.userId || req.session.user?.id;
    const userType = req.session.user?.userType || req.session.user?.role;
    
    console.log(`Getting contracts for ${userType}: ${userId}`);
    
    const contracts = await dbService.getContracts(userId, userType);
    res.json({ contracts, success: true });
  } catch (error) {
    console.error('Error fetching contracts:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to fetch contracts' 
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

// Saved jobs endpoints
app.get('/api/saved-jobs', async (req, res) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const savedJobs = await dbService.getSavedJobs(req.session.userId);
    
    res.json({
      status: 'success',
      savedJobs: savedJobs,
      total: savedJobs.length
    });
  } catch (error) {
    console.error('Saved jobs fetch error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch saved jobs'
    });
  }
});

app.post('/api/saved-jobs', async (req, res) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const { jobId } = req.body;
    await dbService.saveJob(req.session.userId, jobId);
    
    res.status(201).json({
      status: 'success',
      message: 'Job saved successfully'
    });
  } catch (error) {
    console.error('Save job error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to save job'
    });
  }
});

app.delete('/api/saved-jobs/:jobId', async (req, res) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const { jobId } = req.params;
    await dbService.unsaveJob(req.session.userId, parseInt(jobId));
    
    res.json({
      status: 'success',
      message: 'Job unsaved successfully'
    });
  } catch (error) {
    console.error('Unsave job error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to unsave job'
    });
  }
});

// Contracts endpoints
app.get('/api/contracts', async (req, res) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const user = await dbService.getUserById(req.session.userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    const contracts = await dbService.getUserContracts(req.session.userId, user.userType);
    
    res.json({
      success: true,
      contracts: contracts
    });
  } catch (error) {
    console.error('Contracts fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contracts'
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

// Payment system endpoints
app.post('/api/payments/request', requireSessionAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const userType = req.session.user?.userType || req.session.user?.role;
    
    if (userType !== 'freelancer') {
      return res.status(403).json({
        status: 'error',
        message: 'Only freelancers can create payment requests'
      });
    }

    const { contractId, clientId, amount, description } = req.body;
    
    if (!contractId || !clientId || !amount || !description) {
      return res.status(400).json({
        status: 'error',
        message: 'Contract ID, client ID, amount, and description are required'
      });
    }

    const paymentRequest = await dbService.createPaymentRequest({
      contractId: parseInt(contractId),
      freelancerId: userId,
      clientId,
      amount: parseInt(amount * 100), // Convert to cents
      description
    });

    res.json({
      status: 'success',
      paymentRequest
    });
  } catch (error) {
    console.error('Payment request creation error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create payment request'
    });
  }
});

app.get('/api/payments', requireSessionAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const userType = req.session.user?.userType || req.session.user?.role;
    
    const paymentRequests = await dbService.getPaymentRequestsByUser(userId, userType);
    
    res.json({
      status: 'success',
      paymentRequests
    });
  } catch (error) {
    console.error('Get payment requests error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch payment requests'
    });
  }
});

app.post('/api/payments/:requestId/approve', requireSessionAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const userType = req.session.user?.userType || req.session.user?.role;
    
    if (userType !== 'client') {
      return res.status(403).json({
        status: 'error',
        message: 'Only clients can approve payment requests'
      });
    }

    const { requestId } = req.params;
    
    const result = await dbService.approvePaymentRequest(parseInt(requestId), userId);
    
    res.json({
      status: 'success',
      message: 'Payment request approved and processed',
      data: result
    });
  } catch (error) {
    console.error('Payment approval error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to approve payment request'
    });
  }
});

app.post('/api/payments/:requestId/reject', requireSessionAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const userType = req.session.user?.userType || req.session.user?.role;
    
    if (userType !== 'client') {
      return res.status(403).json({
        status: 'error',
        message: 'Only clients can reject payment requests'
      });
    }

    const { requestId } = req.params;
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({
        status: 'error',
        message: 'Rejection reason is required'
      });
    }
    
    const result = await dbService.rejectPaymentRequest(parseInt(requestId), userId, reason);
    
    res.json({
      status: 'success',
      message: 'Payment request rejected',
      data: result
    });
  } catch (error) {
    console.error('Payment rejection error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to reject payment request'
    });
  }
});

app.get('/api/transactions', requireSessionAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    
    const transactions = await dbService.getTransactionHistory(userId);
    
    res.json({
      status: 'success',
      transactions
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch transaction history'
    });
  }
});

// Serve static files from dist directory
app.use(express.static('dist'));

// Admin endpoints - require admin authentication
app.get('/api/admin/stats', async (req, res) => {
  try {
    if (!req.session?.user || req.session.user.userType !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Admin access required'
      });
    }

    // Get user statistics
    const totalUsers = await dbService.getTotalUsers();
    const usersByStatus = await dbService.getUsersByStatus();
    const jobStats = await dbService.getJobStatistics();
    
    res.json({
      status: 'success',
      stats: {
        totalUsers: totalUsers.count,
        activeUsers: usersByStatus.active,
        pendingUsers: usersByStatus.pending,
        totalJobs: jobStats.total,
        activeJobs: jobStats.active,
        totalRevenue: 0, // TODO: Implement revenue tracking
        monthlyGrowth: 15 // TODO: Calculate actual growth
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch admin statistics'
    });
  }
});

app.get('/api/admin/users', async (req, res) => {
  try {
    if (!req.session?.user || req.session.user.userType !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Admin access required'
      });
    }

    const users = await dbService.getAllUsersForAdmin();
    
    res.json({
      status: 'success',
      users: users
    });
  } catch (error) {
    console.error('Admin users fetch error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch users'
    });
  }
});

app.put('/api/admin/users/:id', async (req, res) => {
  try {
    if (!req.session?.user || req.session.user.userType !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Admin access required'
      });
    }

    const userId = req.params.id;
    const updates = req.body;
    
    const updatedUser = await dbService.updateUser(userId, updates);
    
    res.json({
      status: 'success',
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Admin user update error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update user'
    });
  }
});

app.delete('/api/admin/users/:id', async (req, res) => {
  try {
    if (!req.session?.user || req.session.user.userType !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Admin access required'
      });
    }

    const userId = req.params.id;
    
    await dbService.deleteUser(userId);
    
    res.json({
      status: 'success',
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Admin user delete error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete user'
    });
  }
});

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
      'GET /api/admin/stats',
      'PUT /api/admin/users/:id',
      'DELETE /api/admin/users/:id'
    ]
  });
});

// Authentication Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('=== REGISTRATION REQUEST ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const { email, password, firstName, lastName, role, company, title, bio, skills, hourlyRate, location, experience } = req.body;

    console.log('Extracted fields:', {
      email, firstName, lastName, role, company, title, bio, skills, hourlyRate, location, experience
    });

    if (!email || !password || !firstName || !lastName) {
      console.log('Validation failed: Missing required fields');
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
    const passwordHash = await dbService.hashPassword(password);

    const userData = {
      id: crypto.randomUUID(),
      email,
      passwordHash,
      firstName,
      lastName,
      userType: role || 'freelancer',
      status: 'active',
      company,
      title,
      bio,
      skills: (() => {
        try {
          if (typeof skills === 'string') {
            return JSON.parse(skills);
          }
          return Array.isArray(skills) ? skills : [];
        } catch (e) {
          console.log('Skills parsing error, using empty array:', e.message);
          return [];
        }
      })(),
      hourlyRate,
      location,
      experience,
      createdAt: new Date()
    };

    console.log('Creating user with data:', JSON.stringify(userData, null, 2));
    const user = await dbService.createUser(userData);
    console.log('User created successfully:', user.id);
    
    // Create session for auto-login
    req.session.userId = user.id;
    req.session.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      userType: user.userType,
      company: user.company,
      title: user.title
    };
    
    console.log('Session created for user:', user.id, 'Email:', user.email);

    res.status(201).json({
      status: 'success',
      message: 'User registered and logged in successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType,
        company: user.company,
        title: user.title
      }
    });

  } catch (error) {
    console.error('=== REGISTRATION ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error details:', error);
    res.status(500).json({
      status: 'error',
      message: 'Registration failed',
      details: error.message
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

app.get('/api/admin/users', requireSessionAuth, async (req, res) => {
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

app.get('/api/admin/stats', requireSessionAuth, async (req, res) => {
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

// Serve static files from dist directory with proper MIME types
app.use(express.static(path.join(__dirname, '../dist'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  }
}));

// 404 handler for API routes and catch-all for SPA
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

// Get contracts for user
app.get('/api/contracts', async (req, res) => {
  try {
    if (!req.session?.user && !req.session?.userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const userId = req.session.userId || req.session.user?.id;
    const userType = req.session.user?.userType || req.session.user?.role;
    
    console.log(`Getting contracts for ${userType}: ${userId}`);
    
    const contracts = await dbService.getContracts(userId, userType);
    res.json({ contracts, success: true });
  } catch (error) {
    console.error('Error fetching contracts:', error);
    res.status(500).json({ 
      status: 'error',
      error: 'Failed to fetch contracts' 
    });
  }
});

// Update proposal status and create contract when accepted
app.patch('/api/proposals/:id/status', async (req, res) => {
  try {
    if (!req.session?.user && !req.session?.userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const { id } = req.params;
    const { status } = req.body;
    const userId = req.session.userId || req.session.user?.id;
    const userType = req.session.user?.userType || req.session.user?.role;

    // Validate that user is a client
    if (userType !== 'client') {
      return res.status(403).json({ 
        status: 'error',
        error: 'Only clients can update proposal status' 
      });
    }

    console.log(`Updating proposal ${id} status to: ${status} by client: ${userId}`);

    const result = await dbService.updateProposalStatus(parseInt(id), status, userId);
    
    if (!result) {
      return res.status(404).json({ 
        status: 'error',
        error: 'Proposal not found or unauthorized' 
      });
    }

    // If proposal is accepted, create a contract
    if (status === 'accepted') {
      try {
        const contract = await dbService.createContract({
          proposalId: parseInt(id),
          clientId: userId,
          freelancerId: result.freelancerId,
          jobId: result.jobId,
          proposedRate: result.proposedRate,
          estimatedDuration: result.estimatedDuration,
          status: 'active',
          startDate: new Date().toISOString()
        });
        console.log('Contract created:', contract);
        
        res.json({ 
          status: 'success',
          message: 'Proposal accepted and contract created successfully',
          proposal: result,
          contract: contract
        });
      } catch (contractError) {
        console.error('Error creating contract:', contractError);
        res.json({ 
          status: 'success',
          message: 'Proposal accepted but contract creation failed',
          proposal: result,
          contractError: contractError.message
        });
      }
    } else {
      res.json({ 
        status: 'success',
        message: `Proposal ${status} successfully`,
        proposal: result 
      });
    }
  } catch (error) {
    console.error('Error updating proposal status:', error);
    res.status(500).json({ 
      status: 'error',
      error: 'Failed to update proposal status' 
    });
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