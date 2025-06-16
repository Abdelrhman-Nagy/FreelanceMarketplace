@echo off
:: IIS Deployment for Hapi.js Freelancing Platform
:: Run as Administrator

echo =======================================
echo Deploying Hapi.js Freelancing Platform
echo =======================================

:: Check Administrator privileges
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Must run as Administrator!
    echo Right-click this file and select "Run as administrator"
    pause
    exit /b 1
)

:: Set deployment variables
set SITE_NAME=FreelancingPlatform
set TARGET_PATH=C:\inetpub\wwwroot\freelancing-platform
set PORT=80

echo Site: %SITE_NAME%
echo Target: %TARGET_PATH%
echo Port: %PORT%
echo.

:: Stop IIS
echo Stopping IIS...
iisreset /stop
if %errorlevel% neq 0 (
    echo Warning: Could not stop IIS
)

:: Remove old deployment
echo Removing old deployment...
if exist "%TARGET_PATH%" (
    rmdir /s /q "%TARGET_PATH%"
)

:: Create deployment directory
echo Creating deployment directory...
mkdir "%TARGET_PATH%"

:: Copy files
echo Copying application files...
xcopy /E /Y . "%TARGET_PATH%\"
if %errorlevel% neq 0 (
    echo ERROR: Failed to copy files
    pause
    exit /b 1
)

:: Set permissions
echo Setting IIS permissions...
icacls "%TARGET_PATH%" /grant IIS_IUSRS:(OI)(CI)F /T

:: Import IIS module
echo Configuring IIS...
powershell -Command "Import-Module WebAdministration"

:: Remove existing site if present
powershell -Command "if (Get-Website -Name '%SITE_NAME%' -ErrorAction SilentlyContinue) { Remove-Website -Name '%SITE_NAME%' }"

:: Remove existing app pool if present  
powershell -Command "if (Get-IISAppPool -Name '%SITE_NAME%' -ErrorAction SilentlyContinue) { Remove-IISAppPool -Name '%SITE_NAME%' }"

:: Create application pool
echo Creating application pool...
powershell -Command "New-IISAppPool -Name '%SITE_NAME%' -Force"
powershell -Command "Set-IISAppPool -Name '%SITE_NAME%' -ProcessModel @{identityType='ApplicationPoolIdentity'} -ManagedRuntimeVersion ''"

:: Create website
echo Creating IIS website...
powershell -Command "New-IISSite -Name '%SITE_NAME%' -PhysicalPath '%TARGET_PATH%' -Port %PORT% -ApplicationPool '%SITE_NAME%'"

:: Start IIS
echo Starting IIS...
iisreset /start

echo.
echo =======================================
echo Deployment Complete!
echo =======================================
echo.
echo Test URLs:
echo Main App: http://localhost/
echo API Health: http://localhost/api/health
echo Jobs API: http://localhost/api/jobs
echo.
echo Database: postgresql://app_user:Xman@123@localhost:5432/freelancing_platform
echo.
pause