# IIS Deployment Troubleshooting Guide

## Current Issue
If you're getting "iisnode was unable to read the configuration file" error, try these solutions in order:

### Solution 1: Use Minimal web.config
The current web.config has been simplified to use only essential iisnode configuration attributes that are universally supported.

### Solution 2: Use Alternative web.config
If the main web.config still fails, try using `web.config.backup`:

1. Rename current `web.config` to `web.config.old`
2. Rename `web.config.backup` to `web.config`
3. Use `app.js` as the entry point instead of `server/index.js`

### Solution 3: Check Your iisnode Version
Run this command to check which attributes your iisnode version supports:
```
type %systemroot%\system32\inetsrv\config\schema\iisnode_schema.xml
```

### Solution 4: Manual Configuration Steps

1. **Install iisnode**: Download from https://github.com/tjanczuk/iisnode
2. **IIS Manager Setup**:
   - Open IIS Manager
   - Select your website
   - Go to Handler Mappings
   - Add Module Mapping:
     - Request path: `*.js`
     - Module: `iisnode`
     - Executable: (leave blank)
     - Name: `iisnode`

3. **Application Pool Settings**:
   - Set .NET CLR Version to "No Managed Code"
   - Set Identity to ApplicationPoolIdentity

4. **Directory Permissions**:
   - Grant IIS_IUSRS read/execute permissions to your app folder
   - Grant modify permissions to temp and logs folders

### Solution 5: Alternative Entry Points
Try these different entry point configurations in web.config:

**Option A**: Direct server file
```xml
<add name="iisnode" path="server/index.js" verb="*" modules="iisnode" />
```

**Option B**: Root app.js file
```xml
<add name="iisnode" path="app.js" verb="*" modules="iisnode" />
```

**Option C**: Different extension
```xml
<add name="iisnode" path="server.js" verb="*" modules="iisnode" />
```

### Files Included for Deployment:
- `web.config` - Main configuration (current)
- `web.config.backup` - Alternative minimal configuration
- `app.js` - Simple entry point for compatibility
- `server/iis-startup.js` - IIS-specific startup file
- `iisnode.yml` - Simplified iisnode configuration
- `DEPLOY_NOW.bat` - Windows batch deployment script
- `DEPLOY_NOW.ps1` - PowerShell deployment script

### Environment Variables
Make sure to set these in your production environment:
```
NODE_ENV=production
DATABASE_URL=your_postgresql_connection_string
```

### Common Issues:
1. **Node.js not in PATH**: Install Node.js and ensure it's accessible globally
2. **Permissions**: Ensure IIS_IUSRS has proper permissions
3. **32-bit vs 64-bit**: Match your Node.js architecture with your IIS application pool
4. **File paths**: Ensure all file paths in web.config are correct relative to your website root

### Testing:
After deployment, test these URLs:
- `http://yoursite.com/` (should serve your app)
- `http://yoursite.com/api/test` (should return API response)