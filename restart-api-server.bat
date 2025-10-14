@echo off
echo ========================================
echo Restarting API Server for Revenue Fix
echo ========================================
echo.

echo Stopping existing Node processes on port 3001...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
    echo Killing process %%a
    taskkill /F /PID %%a 2>nul
)

echo.
echo Waiting 2 seconds...
timeout /t 2 /nobreak >nul

echo.
echo Starting API server...
start "Coffee API Server" cmd /k "npm run dev:api"

echo.
echo ========================================
echo Server restart initiated!
echo ========================================
echo.
echo The server should now be running with the revenue fix.
echo.
echo Test the fix by:
echo 1. Go to the Revenue tab in the farmer dashboard
echo 2. You should see your earnings displayed
echo.
echo If you reported harvests before, they should now show:
echo - Total Earnings: Your 30%% share of all harvests
echo - This Month: Your 30%% share of this month's harvests
echo - Pending Distributions: Revenue not yet distributed
echo.
pause
