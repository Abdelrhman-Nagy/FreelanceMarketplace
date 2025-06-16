# Deploy Your Hapi.js Freelancing Platform to IIS

## Quick Deployment

Your Hapi.js freelancing platform is ready for IIS deployment. Choose one method:

### Method 1: Batch Script (Easiest)
1. **Right-click** `DEPLOY_NOW.bat`
2. Select **"Run as administrator"**
3. Follow the prompts

### Method 2: PowerShell Script
1. **Right-click** PowerShell → **"Run as administrator"**
2. Run: `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`
3. Run: `.\DEPLOY_NOW.ps1`

## What Gets Deployed

### Application Files
- Hapi.js backend server (`server/index.js`)
- React frontend application
- IIS configuration (`web.config`)
- PostgreSQL connection settings
- All dependencies and assets

### IIS Configuration
- **Site Name**: FreelancingPlatform
- **Path**: `C:\inetpub\wwwroot\freelancing-platform`
- **Port**: 80
- **Application Pool**: No Managed Code (Node.js)

### Database Connection
- **PostgreSQL**: `postgresql://app_user:Xman@123@localhost:5432/freelancing_platform`

## After Deployment

Test these URLs:
- **Main Application**: http://localhost/
- **API Health Check**: http://localhost/api/health
- **Jobs API**: http://localhost/api/jobs
- **Dashboard Stats**: http://localhost/api/my-stats

## Prerequisites

Before running deployment:
- Windows with IIS enabled
- Node.js installed
- PostgreSQL running with your database
- Run deployment script as Administrator

## Troubleshooting

If deployment fails:
1. Ensure running as Administrator
2. Check Node.js is installed and in PATH
3. Verify PostgreSQL is running
4. Check Windows Event Viewer for errors
5. Review iisnode logs in `C:\inetpub\wwwroot\freelancing-platform\iisnode\`

Your Hapi.js backend will replace the old Express setup and serve your React freelancing platform correctly on IIS.