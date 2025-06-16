# IIS Deployment - Ready to Run

## Your deployment is ready! Here's what to do:

### Option 1: Automated Deployment (Recommended)
1. **Right-click** on `deploy-simple.bat` 
2. Select **"Run as administrator"**
3. Follow the prompts

### Option 2: PowerShell Deployment
```powershell
# Open PowerShell as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\deploy-clean.ps1
```

### What the deployment will do:
1. **Stop IIS** and clear cache
2. **Install dependencies** (npm install)
3. **Build React application** (npm run build)
4. **Copy files** to `C:\inetpub\wwwroot\freelancing-platform`
5. **Set permissions** for IIS_IUSRS
6. **Create IIS site** "FreelancingPlatform" on port 80
7. **Configure application pool** for Node.js
8. **Start IIS** services

### After successful deployment:
- **Main app**: http://localhost/
- **API health**: http://localhost/api/health
- **Jobs listing**: http://localhost/api/jobs
- **Dashboard stats**: http://localhost/api/my-stats

### Database connection configured:
`postgresql://app_user:Xman@123@localhost:5432/freelancing_platform`

### Prerequisites verified:
- ✅ Hapi.js server configured
- ✅ React application built
- ✅ PostgreSQL connection string set
- ✅ IIS configuration files ready
- ✅ Node.js compatibility ensured

## Troubleshooting
If deployment fails:
1. Ensure you're running as Administrator
2. Check that Node.js is installed
3. Verify PostgreSQL is running
4. Look for errors in the deployment script output

**Your Hapi.js freelancing platform is ready for IIS deployment!**