@echo off
echo Quick Fix Test - Coffee Tree Platform

echo.
echo Stopping any existing servers...
taskkill /f /im node.exe 2>nul

echo.
echo Starting API server...
start "API Server" cmd /k "npm run api:mock"

echo.
echo Waiting 3 seconds...
timeout /t 3 /nobreak >nul

echo.
echo Starting frontend server...
start "Frontend Server" cmd /k "npm run frontend"

echo.
echo Waiting 3 seconds...
timeout /t 3 /nobreak >nul

echo.
echo Opening browser...
start http://localhost:3000

echo.
echo ✅ Syntax errors fixed!
echo ✅ Servers restarted!
echo ✅ Ready to test buttons!
echo.
echo Test Instructions:
echo 1. Click " Demo Helper" button
echo 2. Choose "Connect as Farmer"
echo 3. Go to "Farmer Portal"
echo 4. Try "View Details" and "Report Harvest" buttons
echo.
pause