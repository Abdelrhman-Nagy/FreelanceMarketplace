# IIS Deployment Quick Reference

## 🚀 Quick Start Commands

### Build and Deploy
```cmd
# Build application
deploy.bat

# Configure IIS (run as Administrator)
.\deploy-iis.ps1 -SiteName "FreelancingPlatform" -SitePath "C:\inetpub\wwwroot\FreelancingPlatform"
```

### Essential Verification Commands
```cmd
# Check Node.js installation
node --version
npm --version

# Test IIS website
iisreset
```

## 📁 Critical File Locations

| Component | Location |
|-----------|----------|
| Application Files | `C:\inetpub\wwwroot\FreelancingPlatform` |
| Web Configuration | `C:\inetpub\wwwroot\FreelancingPlatform\web.config` |
| Application Logs | `C:\inetpub\wwwroot\FreelancingPlatform\logs` |
| IIS Logs | `%SystemDrive%\inetpub\logs\LogFiles` |
| Database Schema | `freelancing_platform_sqlserver.sql` |

## ⚙️ Configuration Templates

### SQL Server Connection (web.config)
```xml
<add key="DB_TYPE" value="sqlserver" />
<add key="SQL_SERVER_HOST" value="localhost" />
<add key="SQL_SERVER_USER" value="FreelancingApp" />
<add key="SQL_SERVER_PASSWORD" value="YourPassword123!" />
<add key="SQL_SERVER_DATABASE" value="FreelancingPlatform" />
<add key="SESSION_SECRET" value="your-32-character-secret-key" />
```

### PostgreSQL Connection (web.config)
```xml
<add key="DB_TYPE" value="postgresql" />
<add key="DATABASE_URL" value="postgresql://user:pass@host:5432/database" />
<add key="SESSION_SECRET" value="your-32-character-secret-key" />
```

## 🔧 Common Error Solutions

### 500.19 - Configuration Error
**Symptoms:** White page with configuration error
**Solutions:**
1. Install URL Rewrite Module
2. Check web.config syntax
3. Verify IIS features enabled

### 500.1013 - Node.js Error
**Symptoms:** Application won't start
**Solutions:**
1. Install Node.js v18+
2. Restart IIS after Node.js installation
3. Check Node.js path in system variables

### Database Connection Failed
**Symptoms:** Login/registration errors
**Solutions:**
1. Verify SQL Server is running
2. Test connection string in SSMS
3. Check database user permissions
4. Confirm database exists

### Static Files 404
**Symptoms:** CSS/JS files not loading
**Solutions:**
1. Check file permissions (IIS_IUSRS)
2. Verify Static Content feature enabled
3. Review URL rewrite rules

## 🛠️ Troubleshooting Commands

### IIS Management
```powershell
# Restart IIS
iisreset

# Reset application pool
Restart-WebAppPool -Name "FreelancingPlatform"

# Check application pool status
Get-WebAppPoolState -Name "FreelancingPlatform"
```

### File Permissions
```powershell
# Grant IIS permissions
icacls "C:\inetpub\wwwroot\FreelancingPlatform" /grant "IIS_IUSRS:(F)" /T
icacls "C:\inetpub\wwwroot\FreelancingPlatform" /grant "IUSR:(RX)" /T
```

### Database Testing
```sql
-- Test database connection
SELECT @@VERSION;

-- Check database exists
SELECT name FROM sys.databases WHERE name = 'FreelancingPlatform';

-- Verify tables created
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES;
```

## 📊 Health Check URLs

| Check | URL | Expected Result |
|-------|-----|-----------------|
| Homepage | `http://localhost/` | React application loads |
| API Health | `http://localhost/api/jobs` | JSON response |
| Static Files | `http://localhost/dist/assets/` | CSS/JS files |

## 🔍 Log Locations for Debugging

### Application Logs
- **Location:** `[site-path]\logs\`
- **Contains:** Node.js application errors, database issues

### IIS Logs
- **Location:** `%SystemDrive%\inetpub\logs\LogFiles`
- **Contains:** HTTP requests, status codes, response times

### Windows Event Logs
- **Location:** Event Viewer → Windows Logs → Application
- **Contains:** System-level errors, service failures

## 💡 Performance Tips

### Application Pool Optimization
```powershell
# Set memory limit (1GB)
Set-ItemProperty -Path "IIS:\AppPools\FreelancingPlatform" -Name processModel.privateMemoryLimit -Value 1048576

# Configure recycling
Set-ItemProperty -Path "IIS:\AppPools\FreelancingPlatform" -Name recycling.periodicRestart.time -Value "01:00:00"
```

### Enable Compression
- Already configured in web.config
- Reduces bandwidth usage
- Improves page load times

## 🔒 Security Checklist

- [ ] Enable HTTPS with SSL certificate
- [ ] Update default SQL Server passwords
- [ ] Configure Windows Firewall rules
- [ ] Set strong session secret
- [ ] Enable security headers (included in web.config)
- [ ] Regular Windows Updates
- [ ] Database backup schedule

## 📞 Emergency Recovery

### Application Won't Start
1. Check IIS Manager → Application Pools → FreelancingPlatform status
2. Review logs in `logs` folder
3. Verify database connectivity
4. Restart application pool

### Database Issues
1. Confirm SQL Server service running
2. Test connection with SSMS
3. Check user permissions
4. Verify connection string in web.config

### Complete Reset
```powershell
# Stop application pool
Stop-WebAppPool -Name "FreelancingPlatform"

# Clear logs
Remove-Item "C:\inetpub\wwwroot\FreelancingPlatform\logs\*" -Force

# Restart everything
Start-WebAppPool -Name "FreelancingPlatform"
iisreset
```

Your freelancing platform deployment is now fully documented and ready for production use!