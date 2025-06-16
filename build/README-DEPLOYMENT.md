# Freelancing Platform - IIS Deployment Guide

## FINAL SOLUTION: Express-Based API Handler

The routing issue has been resolved using a proper Express.js application that returns JSON responses from your SQL Server database.

## Quick Deployment

1. **Copy Files**: Extract all build files to your IIS directory:
   ```
   C:\inetpub\wwwroot\FreelancingPlatform\
   ```

2. **Run Deployment**: Execute as Administrator:
   ```powershell
   .\deploy-iis-fixed.ps1
   ```

3. **Test Connection**: Verify your SQL Server setup:
   ```batch
   .\test-web-config.bat
   .\validate-web-config.bat
   ```

4. **Test API**: Run the automated test:
   ```batch
   .\test-api-json.bat
   ```
   
   Or test manually:
   - http://localhost/api/health
   - http://localhost/api/db-test
   - http://localhost/api/jobs  
   - http://localhost/api/users
   - http://localhost/api/stats

## File Structure

```
FreelancingPlatform/
├── api-express.js      # Express-based API with SQL Server integration  
├── web.config          # IIS routing to Express handler
├── public/index.html   # Diagnostic dashboard
├── package.json        # Dependencies (express, mssql, cors, tedious)
├── iisnode.yml         # Node.js performance settings
├── deploy-iis-fixed.ps1 # Deployment script
└── test-api-json.bat   # API testing script
```

## API Endpoints

All endpoints connect directly to your SQL Server database:

- **GET /api/health** - Database connection status
- **GET /api/jobs** - Active job listings with client information
- **GET /api/users** - User records from database
- **GET /api/stats** - Live database statistics (user count, job count)
- **GET /api/test** - Basic connectivity verification

## Database Configuration

Configured for your SQL Server instance:
- Server: DESKTOP-3GN7HPO\SQLEXPRESS
- Database: FreelancingPlatform
- Credentials: As specified in web.config

## What Was Fixed

1. **Express Framework**: Replaced raw HTTP handler with Express.js for proper routing
2. **Response Format**: All endpoints now return JSON with correct Content-Type headers
3. **SQL Server Integration**: Direct connection using mssql and tedious drivers
4. **CORS Configuration**: Proper middleware for cross-origin requests
5. **Error Handling**: Comprehensive error responses for all failure scenarios

## Testing

After deployment:
1. Run `test-api-json.bat` to verify all endpoints return JSON
2. Visit http://localhost/ for the diagnostic dashboard
3. Check that `/api/jobs` returns actual database records instead of JavaScript code

The Express-based handler eliminates the iisnode routing complexity and ensures proper JSON responses from your FreelancingPlatform database.