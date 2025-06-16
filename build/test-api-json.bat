@echo off
echo Testing API endpoints for JSON responses...
echo.

echo Testing /api/health endpoint:
curl -H "Accept: application/json" http://localhost/api/health
echo.
echo.

echo Testing /api/test endpoint:
curl -H "Accept: application/json" http://localhost/api/test
echo.
echo.

echo Testing /api/jobs endpoint:
curl -H "Accept: application/json" http://localhost/api/jobs
echo.
echo.

echo Testing /api/users endpoint:
curl -H "Accept: application/json" http://localhost/api/users
echo.
echo.

echo Testing /api/stats endpoint:
curl -H "Accept: application/json" http://localhost/api/stats
echo.
echo.

echo API testing complete.
pause