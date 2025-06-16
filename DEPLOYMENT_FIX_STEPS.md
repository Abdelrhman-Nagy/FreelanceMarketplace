# IIS Deployment Fix - Step by Step

## Problem Identified
Your IIS deployment is showing the old test page instead of the React application, with API errors.

## Fix Steps (Run these in order)

### 1. Stop IIS and Clear Cache
```cmd
# Run as Administrator
iisreset /stop
```

### 2. Remove Old Deployment
```cmd
# Delete the old deployment directory
rmdir /s /q "C:\inetpub\wwwroot\freelancing-platform"
```

### 3. Fresh Build and Deploy
```cmd
# In your project directory, build the application
npm install
npm run build

# Create deployment directory
mkdir "C:\inetpub\wwwroot\freelancing-platform"

# Copy all files
xcopy /E /Y . "C:\inetpub\wwwroot\freelancing-platform\"
```

### 4. Set Proper Permissions
```cmd
# Grant IIS permissions
icacls "C:\inetpub\wwwroot\freelancing-platform" /grant IIS_IUSRS:(OI)(CI)F /T
icacls "C:\inetpub\wwwroot\freelancing-platform\node_modules" /grant IIS_IUSRS:(OI)(CI)F /T
```

### 5. Update IIS Site Configuration
1. Open **IIS Manager**
2. Delete existing site if present
3. Create new site:
   - **Site name**: FreelancingPlatform
   - **Physical path**: `C:\inetpub\wwwroot\freelancing-platform`
   - **Port**: 80

### 6. Configure Application Pool
1. Select **Application Pools** → Your site pool
2. Set **.NET CLR version**: No Managed Code
3. Set **Managed pipeline mode**: Integrated
4. **Advanced Settings**:
   - **Identity**: ApplicationPoolIdentity
   - **Load User Profile**: True

### 7. Start Services
```cmd
# Start IIS
iisreset /start
```

### 8. Test Deployment
Visit these URLs in order:
1. http://localhost/api/health (should return JSON)
2. http://localhost/api/test (should return JSON)
3. http://localhost/ (should show React app, not test page)

## Files Updated for Fix
- `web.config` - Fixed routing and environment variables
- `server/iis-startup.js` - New IIS-specific startup file
- `public/index.html` - Proper React application entry point
- Built React application in `dist/` folder

## What Was Wrong
1. Old test page was being served instead of React app
2. API routing wasn't properly configured for Hapi.js
3. Environment variables not set for IIS
4. iisnode wasn't using the correct startup file

## Expected Result
After following these steps, you should see your React freelancing platform with working API endpoints, not the old test page.