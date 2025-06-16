@echo off
echo ======================================
echo Freelancing Platform Deployment Test
echo SQL Server Integration Verification
echo ======================================

set SITE_URL=http://localhost
set API_BASE=%SITE_URL%/api

echo.
echo [1/7] Testing main website...
curl -s -w "Status: %%{http_code}\n" %SITE_URL%/ > nul
if %errorlevel% equ 0 (
    echo ✓ Main site accessible
) else (
    echo ✗ Main site failed
)

echo.
echo [2/7] Testing API health endpoint...
curl -s -w "Status: %%{http_code}\n" %API_BASE%/health
echo.

echo.
echo [3/7] Testing SQL Server connectivity...
curl -s -w "Status: %%{http_code}\n" %API_BASE%/test
echo.

echo.
echo [4/7] Testing users data from SQL Server...
curl -s -w "Status: %%{http_code}\n" %API_BASE%/users
echo.

echo.
echo [5/7] Testing jobs data from SQL Server...
curl -s -w "Status: %%{http_code}\n" %API_BASE%/jobs
echo.

echo.
echo [6/7] Testing database statistics...
curl -s -w "Status: %%{http_code}\n" %API_BASE%/stats
echo.

echo.
echo [7/7] File structure verification...
if exist "web.config" (
    echo ✓ web.config found
) else (
    echo ✗ web.config missing
)

if exist "index.js" (
    echo ✓ index.js found
) else (
    echo ✗ index.js missing
)

if exist "server\index.js" (
    echo ✓ server/index.js found
) else (
    echo ✗ server/index.js missing
)

if exist "public\index.html" (
    echo ✓ public/index.html found
) else (
    echo ✗ public/index.html missing
)

if exist "package.json" (
    echo ✓ package.json found
) else (
    echo ✗ package.json missing
)

if exist "node_modules" (
    echo ✓ dependencies installed
) else (
    echo ✗ run 'npm install' first
)

echo.
echo ======================================
echo SQL Server Integration Test Complete
echo Open %SITE_URL% for detailed diagnostics
echo ======================================
pause