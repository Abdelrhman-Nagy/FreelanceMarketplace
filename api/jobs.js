const sql = require('mssql');

const config = {
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

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    const pool = await sql.connect(config);
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
    
    res.end(JSON.stringify({
      jobs: result.recordset,
      total: result.recordset.length,
      status: 'success'
    }));
  } catch (err) {
    res.statusCode = 500;
    res.end(JSON.stringify({
      error: 'Failed to fetch jobs',
      message: err.message
    }));
  }
};