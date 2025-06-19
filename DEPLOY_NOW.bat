@echo off
echo FreelancingPlatform Deployment Script
echo =====================================

echo Installing dependencies...
call npm install --production

echo Building the application...
call npm run build

echo Setting up environment...
if not exist ".env" (
    echo Creating .env file...
    echo NODE_ENV=production > .env
    echo PORT=5000 >> .env
    echo # Add your DATABASE_URL here >> .env
    echo # DATABASE_URL=postgresql://username:password@localhost:5432/freelancing_platform >> .env
)

echo.
echo IMPORTANT: Configure your database connection!
echo Edit web.config and update the DATABASE_URL in the environmentVariables section:
echo   ^<add name="DATABASE_URL" value="postgresql://username:password@localhost:5432/freelancing_platform" /^>

echo Deployment preparation complete!
echo.
echo NEXT STEPS:
echo 1. Update .env file with your database connection string
echo 2. Ensure Node.js is installed on your server
echo 3. Configure IIS with iisnode module
echo 4. Set up application pool for Node.js
echo 5. Deploy files to your IIS website directory
echo.
echo For IIS deployment:
echo - Copy all files to your website directory
echo - Ensure iisnode is installed and configured
echo - Set application pool to "No Managed Code"
echo - Verify web.config permissions
echo.
pause