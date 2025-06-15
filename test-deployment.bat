@echo off
echo Testing IIS Deployment for Freelancing Platform
echo ===============================================

REM Build the application first
echo Building application...
call npm run build

REM Check if build was successful
if not exist "dist\index.html" (
    echo ERROR: Build failed - dist\index.html not found
    echo Running build process manually...
    call npx vite build
)

if not exist "dist\index.html" (
    echo ERROR: Build still failed. Please check your build configuration.
    pause
    exit /b 1
)

echo Build successful - dist folder created

REM Create a minimal test deployment
echo Creating test deployment...
if not exist "test-deployment" mkdir test-deployment

REM Copy essential files for testing
xcopy /E /I /Y dist test-deployment\dist\
xcopy /Y web.config test-deployment\
xcopy /E /I /Y server test-deployment\server\
xcopy /Y package.json test-deployment\

REM Create a simple test page
echo ^<!DOCTYPE html^> > test-deployment\test.html
echo ^<html^>^<head^>^<title^>IIS Test^</title^>^</head^> >> test-deployment\test.html
echo ^<body^>^<h1^>IIS is working!^</h1^>^<p^>If you see this, IIS can serve static files.^</p^>^</body^>^</html^> >> test-deployment\test.html

REM Create logs directory
if not exist "test-deployment\logs" mkdir test-deployment\logs

echo.
echo Test deployment created in 'test-deployment' folder
echo.
echo Manual verification steps:
echo 1. Copy 'test-deployment' folder contents to your IIS directory
echo 2. Test these URLs:
echo    - http://localhost/test.html (should show "IIS is working!")
echo    - http://localhost/dist/index.html (should show React app)
echo    - http://localhost/ (should redirect to React app)
echo.
echo If test.html works but others don't, the issue is with Node.js/React configuration
echo If test.html doesn't work, the issue is with IIS basic setup
echo.

pause