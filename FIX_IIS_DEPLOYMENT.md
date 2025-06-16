# Fix IIS Deployment Issues

## Issue: Still seeing test page instead of React app

### Quick Fix Steps:

1. **Clear IIS Cache and Restart**
```cmd
# Run as Administrator
iisreset /stop
iisreset /start
```

2. **Delete old files from IIS directory**
```cmd
# Navigate to your IIS site directory
cd C:\inetpub\wwwroot\freelancing-platform
# Remove old public/index.html if it exists
del public\index.html
# Copy the correct React index.html
copy public\index.html public\index.html.bak 2>nul
```

3. **Rebuild and redeploy**
```cmd
# In your project directory
npm run build
npm run start
```

4. **Check iisnode logs**
```cmd
# Check for errors in:
dir C:\inetpub\wwwroot\freelancing-platform\iisnode\
# View latest log file for errors
```

5. **Verify API endpoints directly**
Test in browser:
- http://localhost/api/health
- http://localhost/api/test
- http://localhost/api/jobs

### Root Cause:
The screenshot shows a testing page is still being served instead of your React application. This happens when:
1. Old files are cached in IIS
2. The wrong index.html is being served
3. iisnode isn't properly routing to the Hapi.js server

### Solution Applied:
- Updated web.config with proper React SPA routing
- Created IIS-specific startup file
- Fixed environment variable handling
- Added proper fallback routing for React

### Test After Fix:
1. Browse to http://localhost/
2. Should see your React freelancing platform
3. API calls should work without 500 errors