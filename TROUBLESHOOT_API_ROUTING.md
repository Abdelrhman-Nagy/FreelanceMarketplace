# Troubleshoot API Routing Issues in IIS

## Problem
API endpoints returning HTML instead of JSON, causing "Unexpected token" errors in JavaScript.

## Root Cause
IIS is not properly routing `/api/*` requests to the Node.js backend.

## Step-by-Step Fix

### 1. Verify Node.js Installation
```cmd
node --version
npm --version
```
Should return version numbers. If not, install Node.js v18+ from nodejs.org

### 2. Install IIS Node.js Module
Download and install iisnode from: https://github.com/Azure/iisnode/releases
- Choose the version matching your IIS architecture (x64/x86)
- Restart IIS after installation

### 3. Enable Required IIS Features
Run PowerShell as Administrator:
```powershell
Enable-WindowsOptionalFeature -Online -FeatureName IIS-HttpRedirect
Enable-WindowsOptionalFeature -Online -FeatureName IIS-ASPNET45
Enable-WindowsOptionalFeature -Online -FeatureName IIS-NetFxExtensibility45
Enable-WindowsOptionalFeature -Online -FeatureName IIS-ISAPIExtensions
Enable-WindowsOptionalFeature -Online -FeatureName IIS-ISAPIFilter
```

### 4. Verify File Structure
Ensure these files exist in your IIS directory:
```
C:\inetpub\wwwroot\FreelancingPlatform\
├── dist/
│   ├── index.js          ← Node.js backend (REQUIRED)
│   └── public/
│       └── index.html    ← Frontend
├── web.config            ← IIS configuration
├── package.json          ← Dependencies
└── node_modules/         ← Installed packages
```

### 5. Test Node.js File Directly
Navigate to your site directory and test:
```cmd
cd C:\inetpub\wwwroot\FreelancingPlatform
node dist/index.js
```
Should start the server. If errors occur, fix them before proceeding.

### 6. Check IIS Handler Mapping
1. Open IIS Manager
2. Select your website
3. Double-click "Handler Mappings"
4. Look for "iisnode" handler
5. If missing, add it:
   - Request path: `*.js`
   - Module: `iisnode`
   - Executable: `%programfiles%\iisnode\iisnode.dll`

### 7. Verify Application Pool Settings
1. In IIS Manager, go to Application Pools
2. Select your app pool
3. Right-click → Advanced Settings
4. Set:
   - .NET CLR Version: `No Managed Code`
   - Enable 32-Bit Applications: `False` (for x64 systems)
   - Identity: `ApplicationPoolIdentity`

### 8. Set Proper Permissions
Run as Administrator:
```cmd
icacls "C:\inetpub\wwwroot\FreelancingPlatform" /grant "IIS_IUSRS:(OI)(CI)F" /T
icacls "C:\inetpub\wwwroot\FreelancingPlatform\node_modules" /grant "IIS_IUSRS:(OI)(CI)F" /T
```

### 9. Check Event Logs
1. Open Event Viewer
2. Navigate to: Windows Logs → Application
3. Look for iisnode or Node.js related errors
4. Check application logs in: `C:\inetpub\wwwroot\FreelancingPlatform\logs\`

### 10. Test API Endpoints
1. Browse to: `http://localhost/api/jobs`
2. Should return JSON, not HTML
3. Check browser console for detailed error information

## Common Error Solutions

### Error: "iisnode was unable to locate the entry point"
**Solution:** Ensure `dist/index.js` exists and is a valid Node.js file

### Error: "node.exe could not be found"
**Solution:** Install Node.js and restart IIS

### Error: "Access denied"
**Solution:** Set proper file permissions (step 8)

### Error: "Module not found"
**Solution:** Run `npm install` in your site directory

## Verification Commands

Test these URLs in your browser:
- `http://localhost/` → Should show React app
- `http://localhost/api/jobs` → Should return JSON data
- `http://localhost/dist/index.js` → Should execute Node.js (may show blank page)

## Emergency Fallback

If Node.js routing still fails, temporarily test with static JSON:
1. Create `api/jobs/index.json` with sample data
2. Update web.config to serve static JSON files
3. Verify frontend can consume the data
4. Return to fixing Node.js routing

Your API routing should now work correctly with proper JSON responses.