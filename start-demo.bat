@echo off
echo Starting Coffee Tree Platform Demo...
echo.

echo Starting Mock API Server on port 3001...
start "Mock API" cmd /k "node frontend/api-server.js"

timeout /t 2 /nobreak >nul

echo Starting Frontend Server on port 3000...
start "Frontend" cmd /k "node frontend/server.js"

timeout /t 2 /nobreak >nul

echo.
echo Demo servers are starting...
echo.
echo Mock API: http://localhost:3001/health
echo Frontend: http://localhost:3000
echo.
echo Press any key to open the frontend in your browser...
pause >nul

start http://localhost:3000