@echo off
echo ======================================
echo Freelancing Platform Deployment Test
echo Updated Structure Verification
echo ======================================

set SITE_URL=http://localhost
set API_BASE=%SITE_URL%/api

echo.
echo [1/6] Testing main website...
curl -s -w "Status: %%{http_code}\n" %SITE_URL%/ > nul
if %errorlevel% equ 0 (
    echo ✓ Main site accessible
) else (
    echo ✗ Main site failed
)

echo.
echo [2/6] Testing API health endpoint...
curl -s -w "Status: %%{http_code}\n" %API_BASE%/health
echo.

echo.
echo [3/6] Testing jobs endpoint...
curl -s -w "Status: %%{http_code}\n" %API_BASE%/jobs
echo.

echo.
echo [4/6] Testing auth endpoint (401 expected)...
curl -s -w "Status: %%{http_code}\n" %API_BASE%/auth/user
echo.

echo.
echo [5/6] Testing configuration endpoint...
curl -s -w "Status: %%{http_code}\n" %API_BASE%/test
echo.

echo.
echo [6/6] File structure verification...
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

echo.
echo ======================================
echo Deployment verification complete
echo Open %SITE_URL% in your browser
echo ======================================
pause