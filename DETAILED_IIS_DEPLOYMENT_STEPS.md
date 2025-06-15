# Detailed IIS Deployment Steps

## Phase 1: Server Preparation

### Step 1: Install Required Software on Windows Server

#### 1.1 Install Node.js
1. Download Node.js LTS (v18 or higher) from https://nodejs.org/
2. Run the installer as Administrator
3. Select "Automatically install the necessary tools" during installation
4. Verify installation: Open Command Prompt and run:
   ```cmd
   node --version
   npm --version
   ```

#### 1.2 Install IIS and Required Features
1. Open PowerShell as Administrator
2. Run the following commands:
   ```powershell
   # Enable IIS
   Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServerRole -All
   Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServer -All
   Enable-WindowsOptionalFeature -Online -FeatureName IIS-CommonHttpFeatures -All
   Enable-WindowsOptionalFeature -Online -FeatureName IIS-HttpErrors -All
   Enable-WindowsOptionalFeature -Online -FeatureName IIS-HttpLogging -All
   Enable-WindowsOptionalFeature -Online -FeatureName IIS-RequestFiltering -All
   Enable-WindowsOptionalFeature -Online -FeatureName IIS-StaticContent -All
   Enable-WindowsOptionalFeature -Online -FeatureName IIS-DefaultDocument -All
   Enable-WindowsOptionalFeature -Online -FeatureName IIS-DirectoryBrowsing -All
   Enable-WindowsOptionalFeature -Online -FeatureName IIS-ASPNET45 -All
   ```

#### 1.3 Install URL Rewrite Module
1. Download from: https://www.iis.net/downloads/microsoft/url-rewrite
2. Run the installer as Administrator
3. Restart IIS Manager

#### 1.4 Install IISNode
1. Download from: https://github.com/azure/iisnode/releases
2. Choose the correct version (x64 for 64-bit Windows)
3. Run the installer as Administrator
4. Restart IIS

#### 1.5 Install SQL Server (if using SQL Server database)
1. Download SQL Server Express from Microsoft
2. Run installer and follow setup wizard
3. Note the server name and authentication details
4. Install SQL Server Management Studio (SSMS) for database management

### Step 2: Verify IIS Installation
1. Open IIS Manager (Start → type "IIS")
2. Verify the server is running
3. Browse to Default Website to confirm IIS is working

## Phase 2: Application Preparation

### Step 3: Build the Application

#### 3.1 On Your Development Machine
1. Open Command Prompt in your project directory
2. Run the deployment script:
   ```cmd
   deploy.bat
   ```
   This creates a `deployment` folder with:
   - Built React frontend (`dist/` folder)
   - Compiled Node.js backend
   - Configuration files
   - Database schema
   - Production dependencies

#### 3.2 Verify Build Contents
Check that the `deployment` folder contains:
- `dist/` - Frontend files
- `server/` - Backend files
- `node_modules/` - Dependencies
- `web.config` - IIS configuration
- `package.json` - Package information
- `freelancing_platform_sqlserver.sql` - Database schema

### Step 4: Transfer Files to Server

#### 4.1 Copy Application Files
1. Compress the `deployment` folder into a ZIP file
2. Transfer to your Windows Server using:
   - Remote Desktop and copy/paste
   - FTP/SFTP
   - Network share
   - Cloud storage (OneDrive, Google Drive, etc.)

#### 4.2 Extract on Server
1. Create the application directory: `C:\inetpub\wwwroot\FreelancingPlatform`
2. Extract the ZIP contents to this directory
3. Verify all files are present

## Phase 3: Database Setup

### Step 5: Create Database

#### 5.1 Using SQL Server
1. Open SQL Server Management Studio (SSMS)
2. Connect to your SQL Server instance
3. Right-click "Databases" → "New Database"
4. Name it "FreelancingPlatform"
5. Click OK

#### 5.2 Import Database Schema
1. In SSMS, right-click the "FreelancingPlatform" database
2. Select "New Query"
3. Copy and paste the contents of `freelancing_platform_sqlserver.sql`
4. Execute the query (F5)
5. Verify tables are created successfully

#### 5.3 Create Database User (Recommended)
1. In SSMS, expand "Security" → "Logins"
2. Right-click → "New Login"
3. Enter login name (e.g., "FreelancingApp")
4. Choose "SQL Server authentication"
5. Set a strong password
6. Go to "User Mapping" tab
7. Check "FreelancingPlatform" database
8. Select "db_owner" role
9. Click OK

## Phase 4: IIS Configuration

### Step 6: Create IIS Site

#### 6.1 Automatic Setup (Recommended)
1. Copy `deploy-iis.ps1` to your server
2. Open PowerShell as Administrator
3. Navigate to the script location
4. Run:
   ```powershell
   .\deploy-iis.ps1 -SiteName "FreelancingPlatform" -SitePath "C:\inetpub\wwwroot\FreelancingPlatform" -Port 80
   ```

#### 6.2 Manual Setup (Alternative)
1. Open IIS Manager
2. Right-click "Sites" → "Add Website"
3. Fill in:
   - Site name: "FreelancingPlatform"
   - Physical path: "C:\inetpub\wwwroot\FreelancingPlatform"
   - Port: 80 (or your preferred port)
4. Click OK

#### 6.3 Create Application Pool
1. In IIS Manager, click "Application Pools"
2. Right-click → "Add Application Pool"
3. Name: "FreelancingPlatform"
4. .NET CLR version: "No Managed Code"
5. Click OK
6. Right-click the new pool → "Advanced Settings"
7. Set "Process Model" → "Identity" to "ApplicationPoolIdentity"

#### 6.4 Assign Application Pool
1. Select your website in IIS Manager
2. Click "Basic Settings" in the Actions panel
3. Change Application pool to "FreelancingPlatform"
4. Click OK

## Phase 5: Configuration

### Step 7: Configure Database Connection

#### 7.1 Edit web.config
1. Navigate to `C:\inetpub\wwwroot\FreelancingPlatform`
2. Open `web.config` in a text editor
3. Update the database settings:
   ```xml
   <add key="DB_TYPE" value="sqlserver" />
   <add key="SQL_SERVER_HOST" value="localhost" />
   <add key="SQL_SERVER_USER" value="FreelancingApp" />
   <add key="SQL_SERVER_PASSWORD" value="YourStrongPassword" />
   <add key="SQL_SERVER_DATABASE" value="FreelancingPlatform" />
   <add key="SQL_SERVER_PORT" value="1433" />
   ```

#### 7.2 Generate Session Secret
1. Generate a secure random string (32+ characters)
2. Update in web.config:
   ```xml
   <add key="SESSION_SECRET" value="your-secure-random-string-here" />
   ```

### Step 8: Set Permissions

#### 8.1 Set File Permissions
1. Right-click the application folder
2. Select "Properties" → "Security" tab
3. Click "Edit" → "Add"
4. Enter "IIS_IUSRS" and click OK
5. Give "Full Control" permissions
6. Repeat for "IUSR" with "Read & Execute" permissions

#### 8.2 Set Special Folder Permissions
1. Create a `logs` folder in your application directory
2. Give "IIS_IUSRS" full control over this folder

## Phase 6: Testing and Verification

### Step 9: Initial Testing

#### 9.1 Test Basic Functionality
1. Open a web browser
2. Navigate to `http://localhost` (or your server IP)
3. Verify the application loads
4. Check for any console errors in browser developer tools

#### 9.2 Test Database Connection
1. Try to register a new user
2. Verify data is saved to the database
3. Test login functionality

#### 9.3 Check Application Logs
1. Navigate to the `logs` folder in your application directory
2. Review any error logs for issues
3. Check Windows Event Viewer for system errors

### Step 10: Troubleshooting Common Issues

#### 10.1 500.19 Configuration Error
- **Cause**: web.config syntax error or missing IIS features
- **Solution**: 
  - Validate web.config syntax
  - Ensure URL Rewrite Module is installed
  - Check IIS features are enabled

#### 10.2 500.1013 Node.js Error
- **Cause**: Node.js not found or incorrect path
- **Solution**:
  - Verify Node.js installation
  - Check Node.js path in web.config
  - Restart IIS after Node.js installation

#### 10.3 Database Connection Errors
- **Cause**: Incorrect connection string or permissions
- **Solution**:
  - Verify SQL Server is running
  - Check connection string in web.config
  - Ensure database user has proper permissions
  - Test connection from server using SSMS

#### 10.4 Static Files Not Loading
- **Cause**: Permissions or routing issues
- **Solution**:
  - Check file permissions
  - Verify static content is enabled in IIS
  - Review URL rewrite rules

## Phase 7: Production Optimization

### Step 11: Security Configuration

#### 11.1 Enable HTTPS
1. Obtain SSL certificate
2. In IIS Manager, select your site
3. Click "Bindings" → "Add"
4. Type: https, Port: 443
5. Select your SSL certificate

#### 11.2 Configure Security Headers
The web.config already includes basic security headers:
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block

### Step 12: Performance Optimization

#### 12.1 Configure Caching
- Static content caching is already configured for 30 days
- Consider CDN for static assets in production

#### 12.2 Application Pool Settings
1. In IIS Manager, select Application Pools
2. Right-click your pool → "Advanced Settings"
3. Adjust settings:
   - Process Model → Maximum Worker Processes: 1 (or more for high traffic)
   - Recycling → Private Memory Limit: 1048576 (1GB)

### Step 13: Monitoring and Maintenance

#### 13.1 Set Up Monitoring
1. Enable IIS logging
2. Monitor application logs in the `logs` folder
3. Set up Windows Performance Monitor for resource usage

#### 13.2 Backup Strategy
1. Regular database backups using SQL Server Agent
2. File system backups of application directory
3. IIS configuration export

## Verification Checklist

After deployment, verify:
- [ ] Website loads without errors
- [ ] User registration works
- [ ] User login functions correctly
- [ ] Job posting and browsing work
- [ ] Database operations are successful
- [ ] Static files (CSS, JS, images) load properly
- [ ] API endpoints respond correctly
- [ ] Admin functionality is accessible
- [ ] Performance is acceptable
- [ ] Logs are being generated

Your freelancing platform is now successfully deployed on IIS and ready for production use!