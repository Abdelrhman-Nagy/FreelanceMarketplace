// Database configuration switcher
export const DB_TYPE = process.env.DB_TYPE || 'postgresql'; // 'postgresql' or 'sqlserver'

export const DATABASE_CONFIG = {
  // PostgreSQL (current)
  postgresql: {
    url: process.env.DATABASE_URL,
  },
  
  // SQL Server
  sqlserver: {
    user: process.env.SQL_SERVER_USER || '',
    password: process.env.SQL_SERVER_PASSWORD || '',
    server: process.env.SQL_SERVER_HOST || 'localhost',
    database: process.env.SQL_SERVER_DATABASE || 'FreelancingPlatform',
    port: parseInt(process.env.SQL_SERVER_PORT || '1433'),
  }
};

// Environment variables needed for SQL Server:
// SQL_SERVER_USER=your_username
// SQL_SERVER_PASSWORD=your_password  
// SQL_SERVER_HOST=your_server_host
// SQL_SERVER_DATABASE=FreelancingPlatform
// SQL_SERVER_PORT=1433
// DB_TYPE=sqlserver