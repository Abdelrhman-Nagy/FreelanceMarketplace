// Production Express server for IIS with SQL Server integration
const express = require('express');
const sql = require('mssql');
const path = require('path');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware
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

// SQL Server configuration from web.config
const sqlConfig = {
  server: process.env.SQL_SERVER_HOST || 'DESKTOP-3GN7HPO\\SQLEXPRESS',
  database: process.env.SQL_SERVER_DATABASE || 'FreelancingPlatform',
  user: process.env.SQL_SERVER_USER || 'DESKTOP-3GN7HP\\f9123',
  password: process.env.SQL_SERVER_PASSWORD || 'Xman@123',
  port: parseInt(process.env.SQL_SERVER_PORT) || 1433,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

let pool = null;

// Initialize SQL Server connection
async function initializeDatabase() {
  try {
    pool = await sql.connect(sqlConfig);
    console.log('Connected to SQL Server');
    return true;
  } catch (err) {
    console.error('Database connection failed:', err.message);
    return false;
  }
}

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const dbConnected = pool && pool.connected;
  res.json({
    status: dbConnected ? 'healthy' : 'unhealthy',
    service: 'Freelancing Platform API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: dbConnected ? 'Connected' : 'Disconnected',
    environment: process.env.NODE_ENV || 'production'
  });
});

// Test endpoint
app.get('/api/test', async (req, res) => {
  res.json({
    status: 'success',
    message: 'API is working correctly',
    timestamp: new Date().toISOString(),
    server: 'IIS + Node.js',
    database: pool && pool.connected ? 'SQL Server Connected' : 'SQL Server Disconnected'
  });
});

// Users endpoint
app.get('/api/users', async (req, res) => {
  try {
    if (!pool || !pool.connected) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    const result = await pool.request().query('SELECT TOP 10 * FROM users ORDER BY created_at DESC');
    res.json({
      users: result.recordset,
      total: result.recordset.length,
      status: 'success'
    });
  } catch (err) {
    console.error('Users query error:', err);
    res.status(500).json({
      error: 'Failed to fetch users',
      message: err.message
    });
  }
});

// Jobs endpoint
app.get('/api/jobs', async (req, res) => {
  try {
    if (!pool || !pool.connected) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    const result = await pool.request().query(`
      SELECT TOP 20 
        j.*,
        u.first_name + ' ' + u.last_name as client_name,
        u.email as client_email
      FROM jobs j
      LEFT JOIN users u ON j.client_id = u.id
      WHERE j.status = 'active'
      ORDER BY j.created_at DESC
    `);
    
    res.json({
      jobs: result.recordset,
      total: result.recordset.length,
      status: 'success'
    });
  } catch (err) {
    console.error('Jobs query error:', err);
    res.status(500).json({
      error: 'Failed to fetch jobs',
      message: err.message
    });
  }
});

// Create job endpoint
app.post('/api/jobs', async (req, res) => {
  try {
    if (!pool || !pool.connected) {
      return res.status(500).json({ error: 'Database not connected' });
    }

    const { title, description, budget, category, skills, experience_level, client_id } = req.body;
    
    const result = await pool.request()
      .input('title', sql.VarChar, title)
      .input('description', sql.Text, description)
      .input('budget', sql.Decimal(10, 2), budget)
      .input('category', sql.VarChar, category)
      .input('skills', sql.Text, JSON.stringify(skills))
      .input('experience_level', sql.VarChar, experience_level)
      .input('client_id', sql.VarChar, client_id)
      .query(`
        INSERT INTO jobs (title, description, budget, category, skills, experience_level, client_id, status, created_at)
        OUTPUT INSERTED.*
        VALUES (@title, @description, @budget, @category, @skills, @experience_level, @client_id, 'active', GETDATE())
      `);

    res.json({
      job: result.recordset[0],
      status: 'success',
      message: 'Job created successfully'
    });
  } catch (err) {
    console.error('Create job error:', err);
    res.status(500).json({
      error: 'Failed to create job',
      message: err.message
    });
  }
});

// Proposals endpoint
app.get('/api/proposals', async (req, res) => {
  try {
    if (!pool || !pool.connected) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    const result = await pool.request().query(`
      SELECT TOP 20 
        p.*,
        j.title as job_title,
        u.first_name + ' ' + u.last_name as freelancer_name
      FROM proposals p
      LEFT JOIN jobs j ON p.job_id = j.id
      LEFT JOIN users u ON p.freelancer_id = u.id
      ORDER BY p.created_at DESC
    `);
    
    res.json({
      proposals: result.recordset,
      total: result.recordset.length,
      status: 'success'
    });
  } catch (err) {
    console.error('Proposals query error:', err);
    res.status(500).json({
      error: 'Failed to fetch proposals',
      message: err.message
    });
  }
});

// Database statistics endpoint
app.get('/api/stats', async (req, res) => {
  try {
    if (!pool || !pool.connected) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    const [usersCount, jobsCount, proposalsCount] = await Promise.all([
      pool.request().query('SELECT COUNT(*) as count FROM users'),
      pool.request().query('SELECT COUNT(*) as count FROM jobs'),
      pool.request().query('SELECT COUNT(*) as count FROM proposals')
    ]);
    
    res.json({
      totalUsers: usersCount.recordset[0].count,
      totalJobs: jobsCount.recordset[0].count,
      totalProposals: proposalsCount.recordset[0].count,
      status: 'success',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Stats query error:', err);
    res.status(500).json({
      error: 'Failed to fetch statistics',
      message: err.message
    });
  }
});

// Auth user endpoint (mock for testing)
app.get('/api/auth/user', (req, res) => {
  res.status(401).json({
    message: 'Unauthorized - User not logged in',
    status: 'unauthenticated',
    info: 'Authentication not configured in this build'
  });
});

// Catch all API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    path: req.path,
    method: req.method,
    availableEndpoints: [
      'GET /api/health',
      'GET /api/test',
      'GET /api/users',
      'GET /api/jobs',
      'POST /api/jobs',
      'GET /api/proposals',
      'GET /api/stats',
      'GET /api/auth/user'
    ]
  });
});

// Initialize database connection on startup
initializeDatabase().then(connected => {
  if (connected) {
    console.log('Freelancing Platform API ready with SQL Server');
  } else {
    console.log('Freelancing Platform API started (Database connection failed)');
  }
});

// Export for iisnode
module.exports = app;