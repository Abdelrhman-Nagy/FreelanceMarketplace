# Final IIS Deployment Steps

## Issue Identified
Your IIS deployment is showing the old test page because the wrong HTML file is being served. The API returns 500 errors due to configuration issues.

## Complete Fix (Run as Administrator)

### 1. Stop IIS and Clear Cache
```cmd
iisreset /stop
```

### 2. Remove Old Deployment
```cmd
rmdir /s /q "C:\inetpub\wwwroot\freelancing-platform"
```

### 3. Copy Fresh Files
```cmd
mkdir "C:\inetpub\wwwroot\freelancing-platform"
xcopy /E /Y . "C:\inetpub\wwwroot\freelancing-platform\"
```

### 4. Set Permissions
```cmd
icacls "C:\inetpub\wwwroot\freelancing-platform" /grant IIS_IUSRS:(OI)(CI)F /T
```

### 5. Create/Update IIS Site
1. Open **IIS Manager**
2. If site exists, delete it
3. Create new site:
   - **Site name**: FreelancingPlatform
   - **Physical path**: `C:\inetpub\wwwroot\freelancing-platform`
   - **Port**: 80
4. Configure Application Pool:
   - **.NET CLR version**: No Managed Code
   - **Managed pipeline mode**: Integrated

### 6. Start IIS
```cmd
iisreset /start
```

## What's Fixed
- Updated `web.config` for proper Hapi.js routing
- Created `server/iis-startup.js` for IIS compatibility
- Fixed React SPA routing rules
- Added proper environment variables for PostgreSQL
- Built React application correctly

## Test URLs After Deployment
1. **API Health**: http://localhost/api/health
2. **API Test**: http://localhost/api/test  
3. **Jobs API**: http://localhost/api/jobs
4. **Main App**: http://localhost/ (should show React app, not test page)

## Database Connection
Already configured for: `postgresql://app_user:Xman@123@localhost:5432/freelancing_platform`

## Troubleshooting
If issues persist:
1. Check iisnode logs: `C:\inetpub\wwwroot\freelancing-platform\iisnode\`
2. Verify PostgreSQL is running
3. Ensure Node.js is installed and in PATH
4. Check Windows Event Viewer for IIS errors

Your Hapi.js freelancing platform should now work correctly on IIS!