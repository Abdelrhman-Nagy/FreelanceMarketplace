# Connect Your Freelancing Platform to SQL Server

## Quick Setup Steps

### 1. Database Setup
First, run the SQL Server export file in your SQL Server instance:
- Use SQL Server Management Studio or any SQL client
- Run `freelancing_platform_sqlserver.sql` 
- This creates the `FreelancingPlatform` database with all tables and sample data

### 2. Environment Configuration
Create a `.env.local` file in your project root with these variables:

```env
# Switch to SQL Server
DB_TYPE=sqlserver

# SQL Server Connection
SQL_SERVER_HOST=your-server-host.database.windows.net
SQL_SERVER_USER=your-username
SQL_SERVER_PASSWORD=your-password
SQL_SERVER_DATABASE=FreelancingPlatform
SQL_SERVER_PORT=1433

# Required for authentication
SESSION_SECRET=your-session-secret-here
REPL_ID=your-repl-id
REPLIT_DOMAINS=your-domain.replit.app
```

### 3. Connection Examples

**Azure SQL Database:**
```env
SQL_SERVER_HOST=myserver.database.windows.net
SQL_SERVER_USER=myadmin
SQL_SERVER_PASSWORD=MyPassword123!
SQL_SERVER_DATABASE=FreelancingPlatform
```

**Local SQL Server:**
```env
SQL_SERVER_HOST=localhost
SQL_SERVER_USER=sa
SQL_SERVER_PASSWORD=MyPassword123!
SQL_SERVER_DATABASE=FreelancingPlatform
SQL_SERVER_PORT=1433
```

**SQL Server Express:**
```env
SQL_SERVER_HOST=localhost\\SQLEXPRESS
SQL_SERVER_USER=
SQL_SERVER_PASSWORD=
SQL_SERVER_DATABASE=FreelancingPlatform
```

### 4. Test Connection
After setting environment variables, restart your Replit:
- The app will automatically detect `DB_TYPE=sqlserver`
- Check console for "Connected to SQL Server successfully"
- Your app data will now come from SQL Server

## Features Included

✅ **Complete Database Schema**
- All tables: users, jobs, proposals, messages, contracts
- Proper relationships and indexes
- Sample data included

✅ **Automatic Switching**
- Set `DB_TYPE=sqlserver` to use SQL Server
- Set `DB_TYPE=postgresql` to use PostgreSQL
- No code changes needed

✅ **Full Compatibility**
- All existing features work with SQL Server
- User authentication preserved
- Admin dashboard functional

## Troubleshooting

**Connection Issues:**
- Verify SQL Server is accessible
- Check firewall settings
- Ensure correct hostname and port

**Authentication Errors:**
- Verify username/password
- Check SQL Server authentication mode
- For Azure SQL, use SQL authentication

**SSL/Encryption:**
- The connection uses encryption by default
- For local development, `trustServerCertificate: true` is set

## Switching Back to PostgreSQL

To return to PostgreSQL, simply change:
```env
DB_TYPE=postgresql
DATABASE_URL=your-postgresql-url
```

Your SQL Server data will remain intact for future use.