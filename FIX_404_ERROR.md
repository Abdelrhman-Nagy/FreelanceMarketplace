# Fix HTTP 404.0 Error in IIS

## Problem
HTTP Error 404.0 - Not Found: The resource you are looking for has been removed, had its name changed, or is temporarily unavailable.

## Root Causes
1. Missing application files in IIS directory
2. Incorrect file paths in web.config
3. Application not properly built/deployed
4. IIS not configured to serve the correct files

## Step-by-Step Fix

### Step 1: Verify File Structure
Check that your IIS directory has the correct structure:

```
C:\inetpub\wwwroot\FreelancingPlatform\
├── dist/                    ← Frontend files (MUST EXIST)
│   ├── index.html          ← Main entry point
│   ├── assets/
│   │   ├── *.css files
│   │   └── *.js files
│   └── favicon.ico
├── server/                  ← Backend files
│   └── index.js            ← Node.js entry point
├── node_modules/           ← Dependencies
├── web.config              ← IIS configuration
├── package.json
└── logs/                   ← Application logs
```

### Step 2: Build Application Properly
If files are missing, rebuild the application:

```cmd
# On your development machine
npm run build
```

This should create a `dist` folder with:
- index.html
- assets/ folder with CSS/JS files
- Other static assets

### Step 3: Copy Missing Files
If dist folder is missing from your IIS server:

1. Copy the entire `dist` folder from your development machine
2. Place it in `C:\inetpub\wwwroot\FreelancingPlatform\dist\`
3. Ensure `index.html` exists in the dist folder

### Step 4: Fix web.config Paths
Verify your web.config has correct paths:

```xml
<!-- Default documents -->
<defaultDocument>
  <files>
    <clear />
    <add value="dist/index.html" />
  </files>
</defaultDocument>

<!-- URL Rewrite Rules -->
<rule name="Root to React">
  <match url="^$" />
  <action type="Rewrite" url="dist/index.html" />
</rule>
```

### Step 5: Test File Access Directly
Test if files exist by browsing directly:
- `http://localhost/dist/index.html` - Should show React app
- `http://localhost/dist/assets/` - Should show CSS/JS files

### Step 6: Check IIS Application Settings
1. Open IIS Manager
2. Select your website
3. Right-click → "Manage Website" → "Advanced Settings"
4. Verify "Physical Path" points to correct directory
5. Ensure "Application Pool" is set and running

### Step 7: Reset IIS Configuration
```cmd
# Run as Administrator
iisreset /restart
```

## Alternative: Manual Deployment Check

### Verify Build Output
```cmd
# In your project directory
npm run build
dir dist
```

Should show:
- index.html
- assets/ folder
- Other static files

### Manual File Copy
1. Zip your entire project after building
2. Extract to IIS server
3. Ensure all files copied correctly

## Quick Diagnostic Commands

### Check if files exist:
```cmd
dir "C:\inetpub\wwwroot\FreelancingPlatform\dist"
dir "C:\inetpub\wwwroot\FreelancingPlatform\dist\index.html"
```

### Test web.config syntax:
```cmd
cd "C:\inetpub\wwwroot\FreelancingPlatform"
type web.config
```

### Check IIS application pool:
```powershell
Get-WebAppPoolState -Name "FreelancingPlatform"
```

## Common Issues and Solutions

### Issue: dist folder missing
**Solution:** Run `npm run build` and copy dist folder to IIS

### Issue: index.html not found
**Solution:** Verify build process completed successfully

### Issue: Wrong file paths
**Solution:** Update web.config paths to match actual file structure

### Issue: Permissions error
**Solution:** Grant IIS_IUSRS permissions to application folder

### Issue: Application pool stopped
**Solution:** Start application pool in IIS Manager

## Complete Reset Procedure

If nothing works, try this complete reset:

1. **Stop everything:**
   ```cmd
   iisreset /stop
   ```

2. **Clean directory:**
   ```cmd
   del /s /q "C:\inetpub\wwwroot\FreelancingPlatform\*"
   ```

3. **Rebuild and redeploy:**
   ```cmd
   npm run build
   # Copy all files to IIS directory
   ```

4. **Restart IIS:**
   ```cmd
   iisreset /start
   ```

5. **Test access:**
   Browse to `http://localhost`

Your application should now load correctly without 404 errors.