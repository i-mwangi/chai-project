@echo off
echo ========================================
echo Applying Browse Groves Fix
echo ========================================
echo.
echo This will restart the backend API to apply:
echo   1. Health score display fix
echo   2. Location filter functionality fix
echo.
echo ========================================
echo.

echo [1/3] Stopping backend server on port 3001...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
    echo Found process: %%a
    taskkill /PID %%a /F >nul 2>&1
)
echo Done!
echo.

echo [2/3] Waiting 2 seconds...
timeout /t 2 /nobreak >nul
echo.

echo [3/3] Starting backend API server with fixes...
start "Backend API Server" cmd /k "npm run api"
echo.

echo ========================================
echo Fix Applied!
echo ========================================
echo.
echo The backend server is restarting with the fixes.
echo.
echo To test:
echo   1. Go to Investor Portal
echo   2. Click "Browse Groves"
echo   3. Check that health scores show numbers (not "undefined")
echo   4. Try the location filter dropdown - it should filter groves
echo.
echo Frontend doesn't need restart - just refresh your browser!
echo.
pause
