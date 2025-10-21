@echo off
REM Quick setup script for Hedera testnet

echo ========================================
echo Hedera Testnet Setup
echo ========================================
echo.

echo Checking your environment configuration...
echo.

node check-env.js

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo Ready to Deploy!
    echo ========================================
    echo.
    choice /C YN /M "Do you want to deploy all contracts now"
    if errorlevel 2 goto :end
    if errorlevel 1 goto :deploy
) else (
    echo.
    echo ========================================
    echo Configuration Help
    echo ========================================
    echo.
    echo Choose an option:
    echo 1. I need to get testnet credentials
    echo 2. I have credentials but need help configuring
    echo 3. Exit
    echo.
    choice /C 123 /N /M "Enter your choice (1-3): "
    
    if errorlevel 3 goto :end
    if errorlevel 2 goto :help
    if errorlevel 1 goto :generate
)

:generate
echo.
echo Generating new testnet key pair...
node generate-testnet-account.js
echo.
echo Follow the instructions above to complete setup.
pause
goto :end

:help
echo.
echo Opening setup guide...
start TESTNET_SETUP_GUIDE.md
echo.
echo Please follow the guide to configure your .env file.
echo Then run this script again to verify.
pause
goto :end

:deploy
echo.
echo Starting deployment...
call deploy-all-contracts.bat
goto :end

:end
