@echo off
echo ========================================
echo Starting Coffee Platform with Hedera Testnet
echo ========================================
echo.

REM Check if .env file exists
if not exist .env (
    echo ❌ Error: .env file not found!
    echo.
    echo Please run: test-on-hedera.bat first
    echo.
    pause
    exit /b 1
)

REM Check if dist folder exists
if not exist dist (
    echo ⚠️  Warning: dist folder not found
    echo Building TypeScript files...
    call npx tsup
    if errorlevel 1 (
        echo ❌ Build failed
        pause
        exit /b 1
    )
)

echo Starting Hedera Testnet API Server on port 3001...
start "Hedera API" cmd /k "npx tsx api/server.ts"

timeout /t 3 /nobreak >nul

echo Starting Frontend Server on port 3000...
start "Frontend" cmd /k "node frontend/server.js"

timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo Servers are starting...
echo ========================================
echo.
echo Hedera API: http://localhost:3001/health
echo Frontend: http://localhost:3000
echo.
echo ⚠️  IMPORTANT:
echo   1. Ensure you have Hedera testnet credentials in .env
echo   2. Ensure you have testnet HBAR in your account
echo   3. Connect HashPack wallet (set to testnet mode)
echo.
echo 📖 See HEDERA_TESTNET_SETUP_GUIDE.md for details
echo.
echo Press any key to open the frontend in your browser...
pause >nul

start http://localhost:3000

echo.
echo To stop servers: Close the terminal windows
echo.
