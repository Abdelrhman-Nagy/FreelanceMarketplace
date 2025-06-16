# Quick Deployment Guide

## Fixed PowerShell Script Issue

The original `deploy.ps1` had syntax errors. Use one of these corrected versions:

### Option 1: Use the Fixed PowerShell Script
```powershell
# Run as Administrator
.\deploy-fixed.ps1
```

### Option 2: Use the Simple Batch Script
```cmd
# Right-click and "Run as administrator"
deploy-simple.bat
```

## Manual Deployment Steps

If scripts fail, follow these manual steps:

### 1. Prerequisites
- Install Node.js 18+ from https://nodejs.org/
- Enable IIS with Application Development features
- Install iisnode from https://github.com/Azure/iisnode/releases
- Install URL Rewrite Module from Microsoft

### 2. Build Application
```cmd
npm install
npm run build
```

### 3. Copy Files to IIS
```cmd
mkdir C:\inetpub\wwwroot\freelancing-platform
xcopy /E /Y . C:\inetpub\wwwroot\freelancing-platform\
```

### 4. Set Permissions
```cmd
icacls "C:\inetpub\wwwroot\freelancing-platform" /grant IIS_IUSRS:(OI)(CI)F /T
icacls "C:\inetpub\wwwroot\freelancing-platform" /grant "IIS AppPool\DefaultAppPool":(OI)(CI)F /T
```

### 5. Create IIS Site
1. Open IIS Manager
2. Right-click "Sites" → "Add Website"
3. Name: FreelancingPlatform
4. Physical path: C:\inetpub\wwwroot\freelancing-platform
5. Port: 80

### 6. Configure Application Pool
1. Go to Application Pools
2. Select DefaultAppPool
3. Set ".NET CLR Version" to "No Managed Code"
4. Set "Load User Profile" to True

### 7. Test Deployment
- Open http://localhost/api/health
- Open http://localhost/api/jobs
- Open http://localhost/ for the main app

## Database Configuration

Your PostgreSQL connection is already configured in web.config:
```
postgresql://app_user:Xman@123@localhost:5432/freelancing_platform
```

Make sure:
1. PostgreSQL is running
2. Database `freelancing_platform` exists
3. User `app_user` has access with password `Xman@123`

## Troubleshooting

### Common Issues:
1. **500 Internal Server Error**: Check iisnode installation
2. **Cannot connect to database**: Verify PostgreSQL service and credentials
3. **Permission denied**: Run deployment script as Administrator
4. **Node.js not found**: Install Node.js and restart IIS

### Log Locations:
- IIS Logs: `C:\inetpub\logs\LogFiles\`
- Application Logs: `C:\inetpub\wwwroot\freelancing-platform\logs\`