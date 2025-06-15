# Fix IIS Directory Browsing Issue

## Problem
When opening localhost:80, IIS shows a directory listing instead of serving the React application.

## Root Causes
1. Directory browsing is enabled in IIS
2. Default document not properly configured
3. web.config not being read
4. Missing dist/index.html file

## Step-by-Step Fix

### Step 1: Disable Directory Browsing in IIS Manager
1. Open IIS Manager
2. Select your website "FreelancingPlatform"
3. Double-click "Directory Browsing"
4. Click "Disable" in the Actions panel
5. Click "Apply"

### Step 2: Configure Default Document
1. In IIS Manager, select your website
2. Double-click "Default Document"
3. Click "Add..." in Actions panel
4. Add these entries in order:
   - `dist/index.html`
   - `index.html`
5. Remove or disable other default documents
6. Click "Apply"

### Step 3: Verify File Structure
Ensure your deployment folder has this structure:
```
C:\inetpub\wwwroot\FreelancingPlatform\
├── dist/
│   ├── index.html
│   ├── assets/
│   └── [other built files]
├── server/
│   └── index.js
├── web.config
└── package.json
```

### Step 4: Test web.config
1. Navigate to your site folder
2. Open web.config in notepad
3. Verify it contains the updated configuration with:
   - `<directoryBrowse enabled="false" />`
   - Default document settings
   - URL rewrite rules

### Step 5: Check Application Pool
1. In IIS Manager, click "Application Pools"
2. Right-click "FreelancingPlatform" → "Recycle"
3. Ensure the pool is "Started"

### Step 6: Reset IIS
Open Command Prompt as Administrator and run:
```cmd
iisreset
```

### Step 7: Test the Application
1. Open browser
2. Navigate to `http://localhost`
3. Should now show React application instead of directory listing

## Alternative Quick Fix Commands

Run these PowerShell commands as Administrator:

```powershell
# Disable directory browsing
Set-WebConfiguration -Filter "system.webServer/directoryBrowse" -Value @{enabled="false"} -PSPath "IIS:" -Location "FreelancingPlatform"

# Set default document
Set-WebConfiguration -Filter "system.webServer/defaultDocument/files" -Value @{value="dist/index.html"} -PSPath "IIS:" -Location "FreelancingPlatform"

# Restart application pool
Restart-WebAppPool -Name "FreelancingPlatform"
```

## Verification Steps

After applying fixes:
1. Browse to `http://localhost` - should show React app
2. Browse to `http://localhost/api/jobs` - should show JSON or Node.js response
3. Check browser console for any 404 errors on static files

## If Still Not Working

### Check Application Logs
1. Navigate to `C:\inetpub\wwwroot\FreelancingPlatform\logs\`
2. Open the latest log file
3. Look for Node.js startup errors or path issues

### Verify Node.js Installation
```cmd
node --version
npm --version
```

### Test URL Rewrite Module
1. In IIS Manager, select your site
2. Look for "URL Rewrite" feature
3. If missing, install URL Rewrite Module from Microsoft

### Manual File Test
1. Create a simple `test.html` file in your site root:
```html
<!DOCTYPE html>
<html>
<head><title>Test</title></head>
<body><h1>IIS is working!</h1></body>
</html>
```
2. Browse to `http://localhost/test.html`
3. If this works, the issue is with Node.js/React routing

Your application should now serve the React frontend instead of showing the directory listing.