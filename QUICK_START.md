# Quick Start - Deployment Fix

## PowerShell Syntax Issues Fixed

The original PowerShell scripts had syntax errors. Use this working script:

```powershell
# Run as Administrator
.\deploy-working.ps1
```

OR use the batch file (easier):

```cmd
# Right-click and "Run as administrator"  
deploy-simple.bat
```

## If Scripts Still Fail - Manual Steps

1. **Enable IIS with required features:**
   ```powershell
   # Run as Administrator
   Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServerRole,IIS-WebServer,IIS-CommonHttpFeatures,IIS-HttpErrors,IIS-HttpRedirection,IIS-ApplicationDevelopment,IIS-HealthAndDiagnostics,IIS-HttpLogging,IIS-Security,IIS-RequestFiltering,IIS-Performance,IIS-WebServerManagementTools,IIS-ManagementConsole
   ```

2. **Install iisnode:**
   - Download from: https://github.com/Azure/iisnode/releases
   - Install iisnode-full-v0.2.26-x64.msi
   - Restart IIS: `iisreset`

3. **Copy files manually:**
   ```cmd
   mkdir C:\inetpub\wwwroot\freelancing-platform
   xcopy /E /Y . C:\inetpub\wwwroot\freelancing-platform\
   ```

4. **Set permissions:**
   ```cmd
   icacls "C:\inetpub\wwwroot\freelancing-platform" /grant IIS_IUSRS:(OI)(CI)F /T
   ```

5. **Create IIS site in IIS Manager:**
   - Site name: FreelancingPlatform
   - Physical path: C:\inetpub\wwwroot\freelancing-platform
   - Port: 80

## Your Database Configuration

Already configured in web.config:
```
postgresql://app_user:Xman@123@localhost:5432/freelancing_platform
```

## Test URLs

After deployment:
- Main app: http://localhost/
- Health check: http://localhost/api/health  
- Jobs API: http://localhost/api/jobs