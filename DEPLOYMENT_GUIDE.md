# IIS Deployment Guide - Hapi.js Freelancing Platform

## Step-by-Step Deployment Instructions

### Prerequisites Check
1. **Windows Server/Windows 10/11** with IIS enabled
2. **Node.js v16+** installed from [nodejs.org](https://nodejs.org)
3. **PostgreSQL** running with your database:
   - Connection: `postgresql://app_user:Xman@123@localhost:5432/freelancing_platform`

### Quick Deployment (Automated)

**Option 1: PowerShell (Recommended)**
```powershell
# Right-click PowerShell and "Run as Administrator"
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\deploy-clean.ps1
```

**Option 2: Batch File**
```cmd
# Right-click "deploy-simple.bat" and "Run as administrator"
```

### Manual Deployment Steps

#### 1. Enable IIS Features
```powershell
# Run as Administrator
Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServerRole,IIS-WebServer,IIS-CommonHttpFeatures,IIS-HttpErrors,IIS-HttpRedirection,IIS-ApplicationDevelopment,IIS-HealthAndDiagnostics,IIS-HttpLogging,IIS-Security,IIS-RequestFiltering,IIS-Performance,IIS-WebServerManagementTools,IIS-ManagementConsole
```

#### 2. Install iisnode
1. Download iisnode from: https://github.com/Azure/iisnode/releases
2. Install `iisnode-full-v0.2.26-x64.msi`
3. Restart IIS: `iisreset`

#### 3. Prepare Application
```cmd
npm install
npm run build
npx tsc
```

#### 4. Copy Files to IIS
```cmd
mkdir C:\inetpub\wwwroot\freelancing-platform
xcopy /E /Y . C:\inetpub\wwwroot\freelancing-platform\
```

#### 5. Set Permissions
```cmd
icacls "C:\inetpub\wwwroot\freelancing-platform" /grant IIS_IUSRS:(OI)(CI)F /T
icacls "C:\inetpub\wwwroot\freelancing-platform\node_modules" /grant IIS_IUSRS:(OI)(CI)F /T
```

#### 6. Create IIS Site
1. Open **IIS Manager**
2. Right-click **Sites** → **Add Website**
3. Configure:
   - **Site name**: FreelancingPlatform
   - **Physical path**: `C:\inetpub\wwwroot\freelancing-platform`
   - **Port**: 80
   - **Host name**: (leave blank or set your domain)

#### 7. Configure Application Pool
1. In IIS Manager, go to **Application Pools**
2. Select your site's pool
3. Set **.NET CLR version**: No Managed Code
4. Set **Managed pipeline mode**: Integrated

### Environment Variables (Optional)
Set these in web.config or Windows environment:
```
NODE_ENV=production
PGHOST=localhost
PGPORT=5432
PGUSER=app_user
PGPASSWORD=Xman@123
PGDATABASE=freelancing_platform
```

### Testing Deployment
After deployment, test these URLs:
- **Main app**: http://localhost/
- **Health check**: http://localhost/api/health
- **Jobs API**: http://localhost/api/jobs
- **Dashboard stats**: http://localhost/api/my-stats

### Troubleshooting

#### Common Issues:
1. **500 Error**: Check iisnode logs in `C:\inetpub\wwwroot\freelancing-platform\iisnode\`
2. **Node.js not found**: Ensure Node.js is in system PATH
3. **Database connection**: Verify PostgreSQL is running and accessible
4. **Permission denied**: Run deployment script as Administrator

#### Log Locations:
- **IIS logs**: `C:\inetpub\logs\LogFiles\`
- **iisnode logs**: `C:\inetpub\wwwroot\freelancing-platform\iisnode\`
- **Application logs**: Check browser console and network tab

### Production Optimizations
1. Enable compression in IIS
2. Set up SSL certificate
3. Configure caching headers
4. Monitor with Application Insights or similar

### Security Checklist
- [ ] Database credentials secured
- [ ] SSL/HTTPS enabled
- [ ] Directory browsing disabled
- [ ] Error details hidden in production
- [ ] File upload restrictions in place