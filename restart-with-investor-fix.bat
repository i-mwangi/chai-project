@echo off
echo 🔧 Restarting Coffee Tree Platform with Investor Verification Fix

echo.
echo 1. Stopping all Node.js processes...
taskkill /f /im node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo 2. Starting API server with investor verification endpoints...
start "API Server" cmd /k "echo Starting API Server with Investor Verification... && npm run api:mock"

echo.
echo 3. Waiting for API server to start...
timeout /t 4 /nobreak >nul

echo.
echo 4. Starting frontend server...
start "Frontend Server" cmd /k "echo Starting Frontend Server... && npm run frontend"

echo.
echo 5. Waiting for frontend server to start...
timeout /t 3 /nobreak >nul

echo.
echo 6. Testing investor verification endpoint...
curl -s http://localhost:3001/api/investor-verification/status/0.0.123456 > nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ API endpoint is responding
) else (
    echo ⚠️  API endpoint test failed - but servers should be running
)

echo.
echo 7. Opening browser...
start http://localhost:3000

echo.
echo ✅ Servers restarted with investor verification support!
echo.
echo 🧪 Test Instructions:
echo 1. Click "🎯 Demo Helper" button
echo 2. Choose "Connect as Investor"
echo 3. You should see investor onboarding modal
echo 4. Try accessing investor features
echo.
echo 🔍 Debug Info:
echo - API Server: http://localhost:3001
echo - Frontend: http://localhost:3000
echo - Check browser console for any remaining errors
echo.
pause