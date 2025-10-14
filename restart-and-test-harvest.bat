@echo off
echo ========================================
echo Restart Server and Test Harvest Flow
echo ========================================
echo.

echo Step 1: Stopping any running servers on port 3001...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001 ^| findstr LISTENING') do (
    echo Killing process %%a
    taskkill /F /PID %%a 2>nul
)
timeout /t 2 /nobreak >nul
echo.

echo Step 2: Starting API server...
start "API Server" cmd /k "tsx api/server.ts"
echo Waiting for server to initialize (10 seconds)...
timeout /t 10 /nobreak >nul
echo.

echo Step 3: Running harvest reporting test...
echo.
node test-harvest-reporting.cjs
echo.

echo ========================================
echo Test Complete
echo ========================================
echo.
echo Note: The API server is still running in another window.
echo Close that window when you're done testing.
pause
