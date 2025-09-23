@echo off
echo Restarting Coffee Tree Platform Demo...

echo.
echo Stopping any existing servers...
taskkill /f /im node.exe 2>nul

echo.
echo Starting API server...
start "API Server" cmd /k "npm run api:mock"

echo.
echo Waiting for API server to start...
timeout /t 3 /nobreak >nul

echo.
echo Starting frontend server...
start "Frontend Server" cmd /k "npm run frontend"

echo.
echo Waiting for frontend server to start...
timeout /t 3 /nobreak >nul

echo.
echo Opening browser...
start http://localhost:3000

echo.
echo Demo is ready! 
echo - Frontend: http://localhost:3000
echo - API: http://localhost:3001
echo.
echo Press any key to close this window...
pause >nul