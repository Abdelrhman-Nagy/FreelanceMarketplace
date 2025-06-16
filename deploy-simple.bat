@echo off
:: Simple Deployment Script for Freelancing Platform
:: Run as Administrator

echo =================================
echo Freelancing Platform Deployment
echo =================================
echo.

:: Check if running as Administrator
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: This script must be run as Administrator!
    echo Right-click this file and select "Run as administrator"
    pause
    exit /b 1
)

:: Set variables
set SITE_NAME=FreelancingPlatform
set SOURCE_PATH=%~dp0
set TARGET_PATH=C:\inetpub\wwwroot\freelancing-platform
set PORT=80

echo Site Name: %SITE_NAME%
echo Source Path: %SOURCE_PATH%
echo Target Path: %TARGET_PATH%
echo Port: %PORT%
echo.

:: Check Node.js
echo Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found. Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
) else (
    echo ✓ Node.js found
)

:: Stop existing site
echo.
echo Stopping existing site...
powershell -Command "Import-Module WebAdministration; if (Get-Website -Name '%SITE_NAME%' -ErrorAction SilentlyContinue) { Stop-Website -Name '%SITE_NAME%' }" >nul 2>&1
echo ✓ Site stopped (if it was running)

:: Build application
echo.
echo Building application...
if exist package.json (
    echo Installing dependencies...
    call npm install --production
    echo Building frontend...
    call npm run build
    echo ✓ Build completed
) else (
    echo ⚠ No package.json found, skipping build
)

:: Create target directory
echo.
echo Preparing deployment directory...
if exist "%TARGET_PATH%" (
    echo Removing existing files...
    rmdir /s /q "%TARGET_PATH%"
)
mkdir "%TARGET_PATH%"
echo ✓ Directory prepared

:: Copy files
echo.
echo Copying application files...
robocopy "%SOURCE_PATH%" "%TARGET_PATH%" /E /XD node_modules .git logs tmp /XF *.log .env deploy*.* /NFL /NDL /NJH /NJS
echo ✓ Files copied

:: Install production dependencies
echo.
echo Installing production dependencies...
cd /d "%TARGET_PATH%"
if exist package.json (
    call npm install --only=production
    echo ✓ Production dependencies installed
)

:: Set permissions
echo.
echo Setting folder permissions...
icacls "%TARGET_PATH%" /grant IIS_IUSRS:(OI)(CI)F /T /Q >nul 2>&1
icacls "%TARGET_PATH%" /grant "IIS AppPool\DefaultAppPool":(OI)(CI)F /T /Q >nul 2>&1
echo ✓ Permissions set

:: Configure IIS site
echo.
echo Configuring IIS site...
powershell -Command "Import-Module WebAdministration; if (Get-Website -Name '%SITE_NAME%' -ErrorAction SilentlyContinue) { Remove-Website -Name '%SITE_NAME%' }; New-Website -Name '%SITE_NAME%' -PhysicalPath '%TARGET_PATH%' -Port %PORT%" >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Failed to create IIS site. Make sure IIS is installed and you're running as Administrator.
    pause
    exit /b 1
) else (
    echo ✓ IIS site created
)

:: Configure application pool
echo.
echo Configuring application pool...
powershell -Command "Import-Module WebAdministration; Set-ItemProperty -Path 'IIS:\AppPools\DefaultAppPool' -Name processModel.loadUserProfile -Value True; Set-ItemProperty -Path 'IIS:\AppPools\DefaultAppPool' -Name managedRuntimeVersion -Value ''" >nul 2>&1
echo ✓ Application pool configured

:: Start the site
echo.
echo Starting IIS site...
powershell -Command "Import-Module WebAdministration; Start-Website -Name '%SITE_NAME%'" >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠ Error starting site
) else (
    echo ✓ Site started
)

:: Test deployment
echo.
echo Testing deployment...
timeout /t 3 /nobreak >nul
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:%PORT%/api/health' -UseBasicParsing -TimeoutSec 10; if ($response.StatusCode -eq 200) { Write-Host '✓ API health check passed' -ForegroundColor Green } else { Write-Host '⚠ API returned status:' $response.StatusCode -ForegroundColor Yellow } } catch { Write-Host '⚠ API health check failed:' $_.Exception.Message -ForegroundColor Yellow }"

:: Final summary
echo.
echo =========================
echo Deployment Summary
echo =========================
echo Site Name: %SITE_NAME%
echo URL: http://localhost:%PORT%
echo Physical Path: %TARGET_PATH%
echo.
echo Next Steps:
echo 1. Open http://localhost:%PORT% in your browser
echo 2. Check API endpoints:
echo    - http://localhost:%PORT%/api/health
echo    - http://localhost:%PORT%/api/jobs
echo 3. Monitor logs in: %TARGET_PATH%\logs\
echo.
echo Deployment completed!
pause