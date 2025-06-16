# Freelancing Platform - IIS Production Build

This is a complete production build for deploying the Freelancing Platform on Windows IIS with SQL Server integration.

## Quick Start

1. **Download and Extract**: Extract all files to your IIS directory (e.g., `C:\inetpub\wwwroot\FreelancingPlatform`)

2. **Install Dependencies**: Run `npm install` in the deployment directory

3. **Deploy to IIS**: Use the PowerShell script:
   ```powershell
   .\deploy-iis.ps1
   ```

4. **Test Deployment**: Run the verification script:
   ```batch
   .\verify-deployment.bat
   ```

## File Structure

```
FreelancingPlatform/
├── server/
│   └── index.js          # Express API server with SQL Server
├── public/
│   └── index.html        # Frontend diagnostic page
├── web.config            # IIS configuration
├── index.js              # Main entry point
├── package.json          # Node.js dependencies
├── iisnode.yml           # IIS Node.js settings
├── deploy-iis.ps1        # Deployment script
└── verify-deployment.bat # Testing script
```

## SQL Server Integration

The application connects to SQL Server using these settings (configured in web.config):
- Server: DESKTOP-3GN7HPO\SQLEXPRESS
- Database: FreelancingPlatform
- User: DESKTOP-3GN7HP\f9123
- Password: Xman@123

## API Endpoints

- `GET /api/health` - System health check
- `GET /api/test` - API connectivity test
- `GET /api/users` - User records from database
- `GET /api/jobs` - Job listings from database
- `POST /api/jobs` - Create new job posting
- `GET /api/proposals` - Proposal records
- `GET /api/stats` - Database statistics

## Requirements

- Windows Server with IIS
- Node.js 16+ installed
- iisnode module for IIS
- SQL Server Express (configured as specified)
- FreelancingPlatform database with proper schema

## Troubleshooting

1. **API not working**: Check if Node.js and iisnode are properly installed
2. **Database errors**: Verify SQL Server connection string in web.config
3. **404 errors**: Ensure web.config URL rewriting rules are active
4. **Permission issues**: Grant IIS_IUSRS full control to the application directory

Visit `http://localhost/` after deployment to access the diagnostic page and test all endpoints.