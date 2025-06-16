# Freelancing Platform - IIS Deployment Guide

## Fixed API Routing Issue

The API routing has been corrected to return proper JSON responses from your SQL Server database instead of JavaScript code.

## Quick Deployment

1. **Copy Files**: Extract all build files to your IIS directory:
   ```
   C:\inetpub\wwwroot\FreelancingPlatform\
   ```

2. **Run Deployment**: Execute as Administrator:
   ```powershell
   .\deploy-iis-fixed.ps1
   ```

3. **Test API**: Check these endpoints return JSON:
   - http://localhost/api/health
   - http://localhost/api/jobs  
   - http://localhost/api/users
   - http://localhost/api/stats

## File Structure

```
FreelancingPlatform/
├── app.js              # Fixed API server with SQL Server integration
├── web.config          # Corrected IIS routing configuration
├── public/index.html   # Diagnostic dashboard
├── package.json        # Dependencies (express, mssql, cors)
├── iisnode.yml         # Node.js performance settings
└── deploy-iis-fixed.ps1 # Deployment script
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

1. **API Routing**: Corrected web.config to route `/api/*` requests to `app.js`
2. **Response Format**: Ensured all endpoints return proper JSON with correct headers
3. **SQL Server Integration**: Direct connection using mssql driver
4. **CORS Headers**: Added proper cross-origin headers for browser access

## Testing

After deployment, visit http://localhost/ for the diagnostic dashboard. All API endpoints should return JSON data instead of JavaScript code.

The jobs endpoint will now return actual data from your FreelancingPlatform database with client information joined from the users table.