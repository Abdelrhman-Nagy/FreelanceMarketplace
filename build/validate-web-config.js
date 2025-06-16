// Validate web.config connection settings and test actual connectivity
const fs = require('fs');
const sql = require('mssql');

async function validateWebConfig() {
  console.log('Validating web.config connection settings...\n');
  
  try {
    // Read web.config file
    const webConfigContent = fs.readFileSync('web.config', 'utf8');
    
    // Extract connection settings from web.config using simple regex
    const extractSetting = (key) => {
      const regex = new RegExp(`<add key="${key}" value="([^"]*)"`, 'i');
      const match = webConfigContent.match(regex);
      return match ? match[1] : null;
    };
    
    const settings = {
      DB_TYPE: extractSetting('DB_TYPE'),
      SQL_SERVER_HOST: extractSetting('SQL_SERVER_HOST'),
      SQL_SERVER_DATABASE: extractSetting('SQL_SERVER_DATABASE'),
      SQL_SERVER_USER: extractSetting('SQL_SERVER_USER'),
      SQL_SERVER_PASSWORD: extractSetting('SQL_SERVER_PASSWORD'),
      SQL_SERVER_PORT: extractSetting('SQL_SERVER_PORT')
    };
    
    console.log('Web.config Settings Found:');
    console.log(`  DB_TYPE: ${settings.DB_TYPE}`);
    console.log(`  SQL_SERVER_HOST: ${settings.SQL_SERVER_HOST}`);
    console.log(`  SQL_SERVER_DATABASE: ${settings.SQL_SERVER_DATABASE}`);
    console.log(`  SQL_SERVER_USER: ${settings.SQL_SERVER_USER}`);
    console.log(`  SQL_SERVER_PASSWORD: ${settings.SQL_SERVER_PASSWORD ? '[HIDDEN]' : 'NOT SET'}`);
    console.log(`  SQL_SERVER_PORT: ${settings.SQL_SERVER_PORT}\n`);
    
    // Validate required settings
    const requiredSettings = ['DB_TYPE', 'SQL_SERVER_HOST', 'SQL_SERVER_DATABASE', 'SQL_SERVER_USER', 'SQL_SERVER_PASSWORD'];
    const missingSettings = requiredSettings.filter(key => !settings[key]);
    
    if (missingSettings.length > 0) {
      console.log('Missing required settings:', missingSettings.join(', '));
      return;
    }
    
    console.log('All required connection settings are present\n');
    
    // Build connection config from web.config
    const sqlConfig = {
      server: settings.SQL_SERVER_HOST,
      database: settings.SQL_SERVER_DATABASE,
      user: settings.SQL_SERVER_USER,
      password: settings.SQL_SERVER_PASSWORD,
      port: parseInt(settings.SQL_SERVER_PORT) || 1433,
      options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true
      }
    };
    
    console.log('🔗 Testing connection with web.config settings...');
    
    // Test connection
    let pool = null;
    try {
      pool = await sql.connect(sqlConfig);
      console.log('✓ Database connection successful!');
      
      // Test database queries
      const dbTest = await pool.request().query('SELECT DB_NAME() as db, @@VERSION as version, GETDATE() as time');
      const record = dbTest.recordset[0];
      
      console.log(`✓ Connected to database: ${record.db}`);
      console.log(`✓ SQL Server version: ${record.version.split('\n')[0]}`);
      console.log(`✓ Server time: ${record.time}`);
      
      // Check for required tables
      const tablesResult = await pool.request().query(`
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_TYPE = 'BASE TABLE' 
        AND TABLE_NAME IN ('users', 'jobs', 'proposals', 'contracts', 'messages')
        ORDER BY TABLE_NAME
      `);
      
      console.log(`\n📊 Application tables found (${tablesResult.recordset.length}):`);
      tablesResult.recordset.forEach(table => {
        console.log(`  ✓ ${table.TABLE_NAME}`);
      });
      
      // Test sample queries
      try {
        const userCount = await pool.request().query('SELECT COUNT(*) as count FROM users');
        const jobCount = await pool.request().query('SELECT COUNT(*) as count FROM jobs');
        
        console.log(`\n📈 Database statistics:`);
        console.log(`  Users: ${userCount.recordset[0].count}`);
        console.log(`  Jobs: ${jobCount.recordset[0].count}`);
        
      } catch (queryError) {
        console.log(`\n⚠ Sample query failed: ${queryError.message}`);
      }
      
      console.log('\n🎉 Web.config validation completed successfully!');
      console.log('The connection string is properly configured and working.');
      
    } catch (connError) {
      console.log(`\n❌ Database connection failed: ${connError.message}`);
      
      console.log('\n🔧 Troubleshooting checklist:');
      console.log('1. SQL Server Express service is running');
      console.log('2. Instance name is correct: ' + settings.SQL_SERVER_HOST);
      console.log('3. Database exists: ' + settings.SQL_SERVER_DATABASE);
      console.log('4. User has proper permissions: ' + settings.SQL_SERVER_USER);
      console.log('5. Mixed mode authentication is enabled');
      console.log('6. TCP/IP protocol is enabled');
      console.log('7. SQL Server Browser service is running');
      
    } finally {
      if (pool) {
        await pool.close();
      }
    }
    
  } catch (error) {
    console.log(`❌ Error validating web.config: ${error.message}`);
    
    if (error.code === 'ENOENT') {
      console.log('Make sure web.config exists in the current directory.');
    }
  }
}

// Run validation
validateWebConfig().catch(console.error);