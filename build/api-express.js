// Express-based API handler for IIS with SQL Server integration
const express = require('express');
const sql = require('mssql');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

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

// Initialize database connection
async function initDatabase() {
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
  try {
    const dbStatus = pool && pool.connected ? 'Connected' : 'Disconnected';
    res.json({
      status: dbStatus === 'Connected' ? 'healthy' : 'unhealthy',
      service: 'Freelancing Platform API',
      timestamp: new Date().toISOString(),
      database: dbStatus,
      environment: 'production'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint
app.get('/api/test', async (req, res) => {
  try {
    res.json({
      status: 'success',
      message: 'Express API working correctly',
      timestamp: new Date().toISOString(),
      database: pool && pool.connected ? 'SQL Server Connected' : 'SQL Server Disconnected'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
        j.id,
        j.title,
        j.description,
        j.budget,
        j.category,
        j.skills,
        j.experience_level,
        j.status,
        j.created_at,
        j.client_id,
        COALESCE(u.first_name + ' ' + u.last_name, 'Unknown Client') as client_name,
        u.email as client_email
      FROM jobs j
      LEFT JOIN users u ON j.client_id = u.id
      WHERE j.status = 'active'
      ORDER BY j.created_at DESC
    `);

    res.json({
      jobs: result.recordset,
      total: result.recordset.length,
      status: 'success',
      source: 'SQL Server Database'
    });
  } catch (error) {
    console.error('Jobs endpoint error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Users endpoint
app.get('/api/users', async (req, res) => {
  try {
    if (!pool || !pool.connected) {
      return res.status(500).json({ error: 'Database not connected' });
    }

    const result = await pool.request().query(`
      SELECT TOP 10 
        id, 
        first_name, 
        last_name, 
        email, 
        user_type, 
        created_at
      FROM users 
      ORDER BY created_at DESC
    `);

    res.json({
      users: result.recordset,
      total: result.recordset.length,
      status: 'success'
    });
  } catch (error) {
    console.error('Users endpoint error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Stats endpoint
app.get('/api/stats', async (req, res) => {
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
      status: 'success',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Stats endpoint error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 404 handler for unknown API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    path: req.path,
    availableEndpoints: ['/api/health', '/api/test', '/api/jobs', '/api/users', '/api/stats']
  });
});

// Initialize database connection
initDatabase();

// Export Express app for iisnode
module.exports = app;