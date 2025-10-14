@echo off
echo ========================================
echo Restarting ALL Servers
echo ========================================
echo.

echo [1/5] Stopping backend server on port 3001...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
    echo Found process: %%a
    taskkill /PID %%a /F >nul 2>&1
)
echo Done!
echo.

echo [2/5] Stopping frontend server on port 3002...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3002') do (
    echo Found process: %%a
    taskkill /PID %%a /F >nul 2>&1
)
echo Done!
echo.

echo [3/5] Waiting 2 seconds...
timeout /t 2 /nobreak >nul
echo.

echo [4/5] Starting backend API server...
start "Backend API Server" cmd /k "tsx api/server.ts"
echo Waiting 3 seconds for backend to start...
timeout /t 3 /nobreak >nul
echo.

echo [5/5] Starting frontend mock server...
start "Frontend Mock Server" cmd /k "node frontend/api-server.js"
echo.

echo ========================================
echo All servers restarted!
echo ========================================
echo.
echo Two new windows should open:
echo   1. Backend API Server (port 3001)
echo   2. Frontend Mock Server (port 3002)
echo.
echo To verify both servers are running, run:
echo   npx tsx check-servers.ts
echo.
echo To test the investment fix, run:
echo   npx tsx debug-portfolio.ts
echo.
pause
