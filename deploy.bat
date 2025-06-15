@echo off
echo Building Freelancing Platform for IIS deployment...

REM Build the application
call npm run build

REM Create deployment directory
if not exist "deployment" mkdir deployment

REM Copy built files
echo Copying built application files...
xcopy /E /I /Y dist deployment\
xcopy /Y web.config deployment\
xcopy /Y freelancing_platform_sqlserver.sql deployment\
xcopy /E /I /Y server deployment\server\
xcopy /Y package.json deployment\

REM Copy Node.js dependencies (production only)
echo Copying production dependencies...
cd deployment
call npm install --production --omit=dev

REM Create logs directory
if not exist "logs" mkdir logs

echo.
echo Deployment package created in 'deployment' folder!
echo.
echo Next steps:
echo 1. Copy the 'deployment' folder contents to your IIS server
echo 2. Run deploy-iis.ps1 as Administrator on the IIS server
echo 3. Install Node.js and iisnode on the server
echo 4. Configure database connection in web.config
echo.
echo Your application will be ready for IIS hosting!

cd ..
pause