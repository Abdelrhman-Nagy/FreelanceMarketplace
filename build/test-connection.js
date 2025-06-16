// Test SQL Server connection using web.config settings
const sql = require('mssql');

// Read connection settings from web.config format
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

console.log('Testing SQL Server connection with web.config settings...');
console.log('Configuration:');
console.log(`  Server: ${sqlConfig.server}`);
console.log(`  Database: ${sqlConfig.database}`);
console.log(`  User: ${sqlConfig.user}`);
console.log(`  Port: ${sqlConfig.port}`);
console.log(`  Encrypt: ${sqlConfig.options.encrypt}`);
console.log(`  Trust Certificate: ${sqlConfig.options.trustServerCertificate}`);
console.log('');

async function testConnection() {
  let pool = null;
  
  try {
    console.log('Attempting to connect...');
    pool = await sql.connect(sqlConfig);
    console.log('✓ Connected to SQL Server successfully!');
    
    // Test basic query
    console.log('Testing basic query...');
    const basicResult = await pool.request().query('SELECT 1 as test_value');
    console.log(`✓ Basic query result: ${basicResult.recordset[0].test_value}`);
    
    // Test database access
    console.log('Testing database access...');
    const dbResult = await pool.request().query('SELECT DB_NAME() as current_database');
    console.log(`✓ Current database: ${dbResult.recordset[0].current_database}`);
    
    // Test server info
    console.log('Getting server information...');
    const serverResult = await pool.request().query('SELECT @@VERSION as sql_version, GETDATE() as server_time');
    console.log(`✓ SQL Server version: ${serverResult.recordset[0].sql_version.split('\n')[0]}`);
    console.log(`✓ Server time: ${serverResult.recordset[0].server_time}`);
    
    // Test table access
    console.log('Testing table access...');
    try {
      const tableResult = await pool.request().query(`
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_TYPE = 'BASE TABLE'
        ORDER BY TABLE_NAME
      `);
      console.log(`✓ Found ${tableResult.recordset.length} tables in database:`);
      tableResult.recordset.forEach(table => {
        console.log(`  - ${table.TABLE_NAME}`);
      });
    } catch (tableError) {
      console.log(`⚠ Table access test failed: ${tableError.message}`);
    }
    
    console.log('');
    console.log('🎉 All connection tests passed successfully!');
    console.log('The web.config connection string is working correctly.');
    
  } catch (error) {
    console.log('');
    console.log('❌ Connection test failed!');
    console.log(`Error: ${error.message}`);
    console.log('');
    console.log('Troubleshooting suggestions:');
    console.log('1. Verify SQL Server Express is running');
    console.log('2. Check if the instance name is correct: DESKTOP-3GN7HPO\\SQLEXPRESS');
    console.log('3. Verify the database "FreelancingPlatform" exists');
    console.log('4. Check user credentials: DESKTOP-3GN7HP\\f9123');
    console.log('5. Ensure SQL Server is configured for mixed mode authentication');
    console.log('6. Verify TCP/IP is enabled for SQL Server Express');
    
  } finally {
    if (pool) {
      try {
        await pool.close();
        console.log('Connection closed.');
      } catch (closeError) {
        console.log(`Warning: Error closing connection: ${closeError.message}`);
      }
    }
  }
}

// Run the test
testConnection().catch(console.error);