// Standalone API server for IIS with direct SQL Server integration
const express = require('express');
const sql = require('mssql');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
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

// SQL Server configuration
const sqlConfig = {
  server: 'DESKTOP-3GN7HPO\\SQLEXPRESS',
  database: 'FreelancingPlatform',
  user: 'DESKTOP-3GN7HP\\f9123',
  password: 'Xman@123',
  port: 1433,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

let pool = null;

// Initialize database
async function initDB() {
  try {
    pool = await sql.connect(sqlConfig);
    console.log('SQL Server connected');
    return true;
  } catch (err) {
    console.error('Database connection failed:', err.message);
    return false;
  }
}

// Health endpoint
app.get('/health', async (req, res) => {
  res.json({
    status: pool && pool.connected ? 'healthy' : 'unhealthy',
    service: 'Freelancing Platform API',
    timestamp: new Date().toISOString(),
    database: pool && pool.connected ? 'Connected' : 'Disconnected'
  });
});

// Jobs endpoint
app.get('/jobs', async (req, res) => {
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

// Users endpoint
app.get('/users', async (req, res) => {
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
    res.status(500).json({
      error: 'Failed to fetch users',
      message: err.message
    });
  }
});

// Stats endpoint
app.get('/stats', async (req, res) => {
  try {
    if (!pool || !pool.connected) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    const [usersCount, jobsCount] = await Promise.all([
      pool.request().query('SELECT COUNT(*) as count FROM users'),
      pool.request().query('SELECT COUNT(*) as count FROM jobs')
    ]);
    
    res.json({
      totalUsers: usersCount.recordset[0].count,
      totalJobs: jobsCount.recordset[0].count,
      status: 'success'
    });
  } catch (err) {
    res.status(500).json({
      error: 'Failed to fetch statistics',
      message: err.message
    });
  }
});

// Test endpoint
app.get('/test', async (req, res) => {
  res.json({
    status: 'success',
    message: 'API working correctly',
    timestamp: new Date().toISOString(),
    database: pool && pool.connected ? 'SQL Server Connected' : 'SQL Server Disconnected'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    availableEndpoints: ['/health', '/jobs', '/users', '/stats', '/test']
  });
});

// Initialize database and start
initDB();

module.exports = app;