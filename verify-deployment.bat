@echo off
echo Verifying IIS Deployment Status
echo ================================

REM Check if required files exist
echo Checking file structure...

if exist "dist\public\index.html" (
    echo ✓ Frontend files: dist\public\index.html found
) else (
    echo ✗ Frontend files: Missing dist\public\index.html
    goto :error
)

if exist "dist\index.js" (
    echo ✓ Backend files: dist\index.js found
) else (
    echo ✗ Backend files: Missing dist\index.js
    goto :error
)

if exist "web.config" (
    echo ✓ IIS config: web.config found
) else (
    echo ✗ IIS config: Missing web.config
    goto :error
)

echo.
echo File structure verification complete!
echo.

REM Display file sizes
echo File sizes:
for %%f in ("dist\public\index.html") do echo   Frontend: %%~zf bytes
for %%f in ("dist\index.js") do echo   Backend: %%~zf bytes
for %%f in ("web.config") do echo   Config: %%~zf bytes

echo.
echo Deployment package is ready for IIS!
echo.
echo Next steps for your IIS server:
echo 1. Copy all files to: C:\inetpub\wwwroot\FreelancingPlatform\
echo 2. Ensure IIS features are enabled (URL Rewrite, Node.js)
echo 3. Configure application pool
echo 4. Test: http://localhost/
echo.
echo Expected behavior:
echo - http://localhost/ should show the test page
echo - http://localhost/api/jobs should return JSON data
echo - No more 404 errors on the root URL
echo.
goto :end

:error
echo.
echo ERROR: Deployment verification failed!
echo Run 'npm run build' to generate missing files.
echo.
pause
exit /b 1

:end
echo Verification complete!
pause