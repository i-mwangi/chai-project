@echo off
echo Fixing Investor API Endpoints...

echo.
echo Stopping API server...
taskkill /f /im node.exe /fi "WINDOWTITLE eq API Server*" 2>nul

echo.
echo Waiting 2 seconds...
timeout /t 2 /nobreak >nul

echo.
echo Starting API server with investor verification endpoints...
start "API Server" cmd /k "npm run api:mock"

echo.
echo Waiting 3 seconds for server to start...
timeout /t 3 /nobreak >nul

echo.
echo Testing investor verification endpoint...
curl -s http://localhost:3001/api/investor-verification/status/0.0.123456

echo.
echo.
echo API server restarted with investor verification support!
echo Test the investor verification now.
echo.
pause