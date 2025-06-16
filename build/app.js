// Simple HTTP server for IIS with SQL Server integration
const http = require('http');
const url = require('url');
const sql = require('mssql');

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

// Helper function to send JSON response
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  });
  res.end(JSON.stringify(data, null, 2));
}

// Handle requests
async function handleRequest(req, res) {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    sendJSON(res, 200, { status: 'ok' });
    return;
  }

  try {
    // API Routes
    if (pathname === '/api/health') {
      const dbStatus = pool && pool.connected ? 'Connected' : 'Disconnected';
      sendJSON(res, 200, {
        status: dbStatus === 'Connected' ? 'healthy' : 'unhealthy',
        service: 'Freelancing Platform API',
        timestamp: new Date().toISOString(),
        database: dbStatus,
        environment: 'production'
      });
      return;
    }

    if (pathname === '/api/test') {
      sendJSON(res, 200, {
        status: 'success',
        message: 'API working correctly',
        timestamp: new Date().toISOString(),
        database: pool && pool.connected ? 'SQL Server Connected' : 'SQL Server Disconnected'
      });
      return;
    }

    if (pathname === '/api/jobs') {
      if (!pool || !pool.connected) {
        sendJSON(res, 500, { error: 'Database not connected' });
        return;
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

      sendJSON(res, 200, {
        jobs: result.recordset,
        total: result.recordset.length,
        status: 'success',
        source: 'SQL Server Database'
      });
      return;
    }

    if (pathname === '/api/users') {
      if (!pool || !pool.connected) {
        sendJSON(res, 500, { error: 'Database not connected' });
        return;
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

      sendJSON(res, 200, {
        users: result.recordset,
        total: result.recordset.length,
        status: 'success'
      });
      return;
    }

    if (pathname === '/api/stats') {
      if (!pool || !pool.connected) {
        sendJSON(res, 500, { error: 'Database not connected' });
        return;
      }

      const [usersCount, jobsCount] = await Promise.all([
        pool.request().query('SELECT COUNT(*) as count FROM users'),
        pool.request().query('SELECT COUNT(*) as count FROM jobs')
      ]);

      sendJSON(res, 200, {
        totalUsers: usersCount.recordset[0].count,
        totalJobs: jobsCount.recordset[0].count,
        status: 'success',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // API 404
    if (pathname.startsWith('/api/')) {
      sendJSON(res, 404, {
        error: 'API endpoint not found',
        path: pathname,
        availableEndpoints: ['/api/health', '/api/test', '/api/jobs', '/api/users', '/api/stats']
      });
      return;
    }

    // Default 404
    sendJSON(res, 404, { error: 'Not found', path: pathname });

  } catch (error) {
    console.error('Request error:', error);
    sendJSON(res, 500, {
      error: 'Internal server error',
      message: error.message
    });
  }
}

// Initialize database connection
initDatabase();

// Export for iisnode
module.exports = handleRequest;