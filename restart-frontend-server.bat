@echo off
echo ========================================
echo Restarting Frontend Mock Server
echo ========================================
echo.

echo [1/3] Stopping existing server on port 3002...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3002') do (
    echo Found process: %%a
    taskkill /PID %%a /F >nul 2>&1
)
echo Done!
echo.

echo [2/3] Waiting 2 seconds...
timeout /t 2 /nobreak >nul
echo.

echo [3/3] Starting frontend server...
echo.
start "Frontend Mock Server" cmd /k "node frontend/api-server.js"
echo.

echo ========================================
echo Server restart initiated!
echo ========================================
echo.
echo A new window should open with the server running.
echo.
echo To verify both servers are running, run:
echo   npx tsx check-servers.ts
echo.
echo To test the fix, run:
echo   npx tsx debug-portfolio.ts
echo.
pause
