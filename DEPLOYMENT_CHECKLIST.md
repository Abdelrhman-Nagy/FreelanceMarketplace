# IIS Deployment Checklist

## Pre-Deployment Setup

### ✅ Server Requirements
- [ ] Windows Server with IIS installed
- [ ] Node.js v18+ installed
- [ ] IISNode module installed
- [ ] URL Rewrite Module installed
- [ ] SQL Server / SQL Server Express (if using SQL Server database)

### ✅ Files Ready
- [ ] `web.config` - IIS configuration
- [ ] `deploy-iis.ps1` - Server setup script
- [ ] `deploy.bat` - Build and package script
- [ ] `freelancing_platform_sqlserver.sql` - Database schema
- [ ] `IIS_DEPLOYMENT_GUIDE.md` - Complete setup instructions

## Deployment Steps

### 1. Build Application
```cmd
deploy.bat
```
This creates a `deployment` folder with production-ready files.

### 2. Copy to Server
Transfer the `deployment` folder contents to your IIS server directory (e.g., `C:\inetpub\wwwroot\FreelancingPlatform`)

### 3. Configure IIS
Run PowerShell as Administrator:
```powershell
.\deploy-iis.ps1 -SiteName "FreelancingPlatform" -SitePath "C:\inetpub\wwwroot\FreelancingPlatform"
```

### 4. Database Setup
- Import `freelancing_platform_sqlserver.sql` in SQL Server Management Studio
- Note database connection details for configuration

### 5. Environment Configuration
Edit `web.config` with your settings:
- SQL Server connection details
- Session secret (generate a secure random string)
- Authentication settings (if using Replit Auth)

### 6. Test Deployment
- Browse to your site URL
- Check application logs in the `logs` folder
- Verify database connectivity
- Test user registration/login

## Configuration Templates

### SQL Server Configuration
```xml
<add key="DB_TYPE" value="sqlserver" />
<add key="SQL_SERVER_HOST" value="your-server-name" />
<add key="SQL_SERVER_USER" value="your-username" />
<add key="SQL_SERVER_PASSWORD" value="your-password" />
<add key="SQL_SERVER_DATABASE" value="FreelancingPlatform" />
<add key="SESSION_SECRET" value="your-secure-session-secret" />
```

### PostgreSQL Configuration
```xml
<add key="DB_TYPE" value="postgresql" />
<add key="DATABASE_URL" value="postgresql://user:pass@host:port/database" />
<add key="SESSION_SECRET" value="your-secure-session-secret" />
```

## Troubleshooting

### Common Issues
- **500.19 Error**: Check web.config syntax and IIS modules
- **500.1013 Error**: Verify Node.js installation path
- **Database errors**: Check connection strings and permissions
- **Static files not loading**: Verify file permissions and URL rewrite rules

### Log Locations
- Application logs: `[site-path]\logs\`
- IIS logs: `%SystemDrive%\inetpub\logs\LogFiles`
- Windows Event Viewer: Application and System logs

## Post-Deployment

### Security
- [ ] Enable HTTPS/SSL certificate
- [ ] Configure firewall rules
- [ ] Set up regular backups
- [ ] Update default passwords

### Monitoring
- [ ] Set up health checks
- [ ] Configure log rotation
- [ ] Monitor disk space and memory
- [ ] Set up automated backups

### Performance
- [ ] Configure application pool recycling
- [ ] Enable output caching where appropriate
- [ ] Set up CDN for static assets (optional)
- [ ] Monitor response times

Your freelancing platform is now production-ready for IIS hosting!