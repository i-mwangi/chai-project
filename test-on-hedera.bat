@echo off
echo ========================================
echo Coffee Platform - Hedera Testnet Setup
echo ========================================
echo.

REM Check if .env file exists
if not exist .env (
    echo [1/5] Creating .env file from template...
    copy .env.example .env
    echo.
    echo ⚠️  IMPORTANT: Edit .env file with your Hedera testnet credentials!
    echo.
    echo You need to add:
    echo   - HEDERA_OPERATOR_ID (your testnet account ID)
    echo   - HEDERA_OPERATOR_KEY (your private key)
    echo.
    echo Get testnet credentials at: https://portal.hedera.com/
    echo Get testnet HBAR at: https://portal.hedera.com/faucet
    echo.
    pause
) else (
    echo [1/5] .env file already exists ✓
)

echo.
echo [2/5] Installing dependencies...
call pnpm install
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo [3/5] Running database migrations...
call pnpm run migrate
if errorlevel 1 (
    echo ⚠️  Database migration failed - continuing anyway
)

echo.
echo [4/5] Building TypeScript files...
if exist dist (
    rmdir /s /q dist
)
call npx tsup
if errorlevel 1 (
    echo ⚠️  Build failed - you can still use mock API
)

echo.
echo [5/5] Setup complete!
echo.
echo ========================================
echo Next Steps:
echo ========================================
echo.
echo 1. Edit .env file with your Hedera testnet credentials
echo    - Get credentials: https://portal.hedera.com/
echo    - Get testnet HBAR: https://portal.hedera.com/faucet
echo.
echo 2. Choose how to run:
echo.
echo    Option A - Mock API (Quick Test, No Hedera Required):
echo      start-demo.bat
echo.
echo    Option B - Real Hedera API (Requires deployed contracts):
echo      start-hedera-testnet.bat
echo.
echo 3. Open http://localhost:3000 in your browser
echo.
echo 4. Connect HashPack wallet (set to testnet mode)
echo.
echo ========================================
echo.
echo 📖 For detailed instructions, see:
echo    HEDERA_TESTNET_SETUP_GUIDE.md
echo.
pause
