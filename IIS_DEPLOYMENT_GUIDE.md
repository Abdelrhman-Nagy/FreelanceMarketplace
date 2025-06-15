# IIS Deployment Guide for Freelancing Platform

## Prerequisites on IIS Server

### 1. Install Required Software
- **Node.js** (v18 or higher): Download from https://nodejs.org/
- **IISNode**: Download from https://github.com/azure/iisnode/releases
- **URL Rewrite Module**: Download from Microsoft IIS site
- **SQL Server** or **SQL Server Express** (if using SQL Server database)

### 2. Enable IIS Features
Run as Administrator in PowerShell:
```powershell
Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServerRole -All
Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServer -All
Enable-WindowsOptionalFeature -Online -FeatureName IIS-CommonHttpFeatures -All
Enable-WindowsOptionalFeature -Online -FeatureName IIS-ASPNET45 -All
```

## Quick Deployment Steps

### 1. Build Application
On your development machine:
```cmd
npm run build
deploy.bat
```
This creates a `deployment` folder with all necessary files.

### 2. Copy to IIS Server
Copy the entire `deployment` folder contents to your IIS server (e.g., `C:\inetpub\wwwroot\FreelancingPlatform`)

### 3. Configure IIS
Run as Administrator:
```powershell
.\deploy-iis.ps1 -SiteName "FreelancingPlatform" -SitePath "C:\inetpub\wwwroot\FreelancingPlatform" -Port 80
```

### 4. Configure Database Connection
Edit `web.config` in your site directory:

**For SQL Server:**
```xml
<appSettings>
  <add key="NODE_ENV" value="production" />
  <add key="DB_TYPE" value="sqlserver" />
  <add key="SQL_SERVER_HOST" value="your-server-host" />
  <add key="SQL_SERVER_USER" value="your-username" />
  <add key="SQL_SERVER_PASSWORD" value="your-password" />
  <add key="SQL_SERVER_DATABASE" value="FreelancingPlatform" />
  <add key="SQL_SERVER_PORT" value="1433" />
  <add key="SESSION_SECRET" value="your-secure-session-secret" />
</appSettings>
```

**For PostgreSQL:**
```xml
<appSettings>
  <add key="NODE_ENV" value="production" />
  <add key="DB_TYPE" value="postgresql" />
  <add key="DATABASE_URL" value="your-postgresql-connection-string" />
  <add key="SESSION_SECRET" value="your-secure-session-secret" />
</appSettings>
```

### 5. Import Database
- For SQL Server: Run `freelancing_platform_sqlserver.sql` in SQL Server Management Studio
- For PostgreSQL: Import your existing database

### 6. Set Permissions
The IIS application pool identity needs permissions:
- Read/Write access to the application directory
- Read/Write access to the `logs` folder
- Execute permissions for Node.js

## Troubleshooting

### Common Issues

**500.19 Error - Configuration Error**
- Check if URL Rewrite Module is installed
- Verify web.config syntax
- Ensure IISNode is installed

**500.1013 Error - Node.js not found**
- Install Node.js on the server
- Verify Node.js path in web.config
- Restart IIS after Node.js installation

**Database Connection Errors**
- Verify connection strings in web.config
- Check SQL Server allows remote connections
- Ensure database exists and user has permissions

**Static Files Not Loading**
- Check file permissions
- Verify static content serving is enabled in IIS
- Review URL rewrite rules

### Performance Optimization

**Application Pool Settings:**
- Set .NET Framework version to "No Managed Code"
- Configure recycling conditions
- Set appropriate memory limits

**IISNode Configuration:**
- Adjust `maxConcurrentRequestsPerProcess` based on server capacity
- Configure logging for production troubleshooting
- Set appropriate timeout values

**Caching:**
- Enable static content caching
- Configure output caching for API responses
- Use CDN for static assets if needed

## Security Considerations

### Web.config Security
- Use encrypted connection strings
- Enable HTTPS redirects
- Configure security headers
- Disable detailed error pages in production

### Database Security
- Use dedicated database user with minimal permissions
- Enable SSL/TLS for database connections
- Regular security updates

### Application Security
- Keep Node.js and dependencies updated
- Use strong session secrets
- Configure CORS appropriately
- Enable request filtering

## Monitoring

### Log Files
- IIS logs: `%SystemDrive%\inetpub\logs\LogFiles`
- Application logs: `[site-path]\logs`
- Node.js stdout/stderr: Configured in web.config

### Health Checks
- Monitor application pool status
- Check database connectivity
- Monitor disk space and memory usage
- Set up automated health checks

## Backup Strategy

### Regular Backups
- Database backups (automated)
- Application files backup
- Configuration files backup
- IIS configuration export

Your freelancing platform is now ready for production use on IIS!