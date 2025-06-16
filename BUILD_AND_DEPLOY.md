# Freelancing Platform - Build and Deploy Guide for Windows IIS

## Prerequisites

### 1. Install Required Software
- **Node.js 18+**: Download from [nodejs.org](https://nodejs.org/)
- **IIS with URL Rewrite Module**: Enable IIS and install URL Rewrite 2.1
- **iisnode**: Download from [GitHub](https://github.com/Azure/iisnode/releases)
- **PostgreSQL**: Install PostgreSQL server or use existing instance

### 2. Enable IIS Features
Open PowerShell as Administrator and run:
```powershell
# Enable IIS
Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServerRole, IIS-WebServer, IIS-CommonHttpFeatures, IIS-HttpErrors, IIS-HttpRedirection, IIS-ApplicationDevelopment, IIS-NetFxExtensibility45, IIS-HealthAndDiagnostics, IIS-HttpLogging, IIS-Security, IIS-RequestFiltering, IIS-Performance, IIS-WebServerManagementTools, IIS-ManagementConsole, IIS-IIS6ManagementCompatibility, IIS-Metabase

# Enable ASP.NET
Enable-WindowsOptionalFeature -Online -FeatureName IIS-ASPNET45
```

### 3. Install iisnode
1. Download iisnode from: https://github.com/Azure/iisnode/releases
2. Run the installer (iisnode-full-v0.2.26-x64.msi)
3. Restart IIS: `iisreset`

### 4. Install URL Rewrite Module
1. Download from: https://www.iis.net/downloads/microsoft/url-rewrite
2. Install the module
3. Restart IIS

## Build Process

### Step 1: Clone and Setup Project
```bash
# Clone your project
git clone <your-repo-url>
cd freelancing-platform

# Install dependencies
npm install
```

### Step 2: Build Production Assets
```bash
# Build React frontend
npm run build

# This creates optimized production files in dist/
```

### Step 3: Prepare Deployment Directory
```bash
# Create deployment directory
mkdir C:\inetpub\wwwroot\freelancing-platform

# Copy files to deployment directory
xcopy /E /I /Y . C:\inetpub\wwwroot\freelancing-platform\
```

## Database Setup

### Step 1: Create PostgreSQL Database
```sql
-- Connect to PostgreSQL as admin
CREATE DATABASE freelancing_platform;
CREATE USER app_user WITH ENCRYPTED PASSWORD 'Xman@123';
GRANT ALL PRIVILEGES ON DATABASE freelancing_platform TO app_user;

-- Connect to freelancing_platform database
\c freelancing_platform

-- Run the provided SQL script
\i create_database.sql
\i database_setup.sql
```

### Step 2: Update Connection String
Update the `web.config` file with your actual PostgreSQL connection details:
```xml
<add name="DATABASE_URL" value="postgresql://app_user:Xman@123@localhost:5432/freelancing_platform" />
```

## IIS Configuration

### Step 1: Create IIS Site
1. Open IIS Manager
2. Right-click "Sites" → "Add Website"
3. Configure:
   - **Site name**: FreelancingPlatform
   - **Physical path**: `C:\inetpub\wwwroot\freelancing-platform`
   - **Port**: 80 (or your preferred port)
   - **Host name**: (optional) your-domain.com

### Step 2: Configure Application Pool
1. In IIS Manager, go to "Application Pools"
2. Right-click "DefaultAppPool" → "Advanced Settings"
3. Set:
   - **.NET CLR Version**: No Managed Code
   - **Identity**: ApplicationPoolIdentity
   - **Load User Profile**: True

### Step 3: Set Folder Permissions
```powershell
# Grant permissions to IIS_IUSRS
icacls "C:\inetpub\wwwroot\freelancing-platform" /grant IIS_IUSRS:(OI)(CI)F /T

# Grant permissions to Application Pool Identity
icacls "C:\inetpub\wwwroot\freelancing-platform" /grant "IIS AppPool\DefaultAppPool":(OI)(CI)F /T
```

### Step 4: Configure Handler Mappings
1. In IIS Manager, select your site
2. Double-click "Handler Mappings"
3. Verify that iisnode handler is present:
   - **Request path**: `*.js`
   - **Module**: iisnode
   - **Executable**: (blank)

## Deployment Script

Create `deploy.ps1` for automated deployment:

```powershell
# PowerShell Deployment Script
param(
    [string]$SourcePath = ".",
    [string]$TargetPath = "C:\inetpub\wwwroot\freelancing-platform"
)

Write-Host "Starting deployment..." -ForegroundColor Green

# Stop IIS site
Write-Host "Stopping IIS site..." -ForegroundColor Yellow
Stop-Website -Name "FreelancingPlatform" -ErrorAction SilentlyContinue

# Build application
Write-Host "Building application..." -ForegroundColor Yellow
npm run build

# Copy files
Write-Host "Copying files..." -ForegroundColor Yellow
if (Test-Path $TargetPath) {
    Remove-Item $TargetPath -Recurse -Force
}
New-Item -ItemType Directory -Path $TargetPath -Force
Copy-Item -Path "$SourcePath\*" -Destination $TargetPath -Recurse -Force

# Set permissions
Write-Host "Setting permissions..." -ForegroundColor Yellow
icacls $TargetPath /grant IIS_IUSRS:`(OI`)`(CI`)F /T
icacls $TargetPath /grant "IIS AppPool\DefaultAppPool":`(OI`)`(CI`)F /T

# Start IIS site
Write-Host "Starting IIS site..." -ForegroundColor Yellow
Start-Website -Name "FreelancingPlatform"

Write-Host "Deployment completed successfully!" -ForegroundColor Green
Write-Host "Site URL: http://localhost" -ForegroundColor Cyan
```

## Testing Deployment

### Step 1: Test API Endpoints
```bash
# Test health endpoint
curl http://localhost/api/health

# Test jobs endpoint
curl http://localhost/api/jobs

# Test static files
curl http://localhost/
```

### Step 2: Check Logs
Monitor logs in:
- IIS logs: `C:\inetpub\logs\LogFiles\W3SVC1\`
- iisnode logs: `C:\inetpub\wwwroot\freelancing-platform\logs\`

## Troubleshooting

### Common Issues

1. **500.1001 - Internal Server Error**
   - Check if Node.js is installed
   - Verify iisnode installation
   - Check handler mappings

2. **Database Connection Issues**
   - Verify PostgreSQL service is running
   - Check connection string in web.config
   - Ensure database exists and user has permissions

3. **File Permissions**
   - Grant IIS_IUSRS full control to application folder
   - Grant Application Pool Identity permissions

4. **URL Rewrite Issues**
   - Install URL Rewrite Module 2.1
   - Check web.config rewrite rules syntax

### Debug Commands
```powershell
# Check IIS status
Get-Website

# Check Application Pools
Get-IISAppPool

# Check Windows Features
Get-WindowsOptionalFeature -Online | Where-Object {$_.FeatureName -like "*IIS*"}

# Test PostgreSQL connection
psql -h localhost -U app_user -d freelancing_platform -c "SELECT version();"
```

## Production Checklist

- [ ] Node.js installed and accessible
- [ ] IIS enabled with required features
- [ ] iisnode installed and configured
- [ ] URL Rewrite Module installed
- [ ] PostgreSQL database created and populated
- [ ] Application files copied to web directory
- [ ] Permissions set correctly
- [ ] IIS site created and configured
- [ ] web.config validated
- [ ] API endpoints tested
- [ ] Frontend loads correctly
- [ ] Database connections working

## Security Considerations

1. **Database Security**
   - Use strong passwords
   - Enable SSL/TLS for database connections
   - Restrict database user permissions

2. **IIS Security**
   - Enable HTTPS
   - Configure security headers
   - Disable unnecessary features

3. **Application Security**
   - Update Node.js regularly
   - Keep dependencies updated
   - Monitor for security vulnerabilities