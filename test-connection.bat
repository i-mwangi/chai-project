@echo off
echo ========================================
echo Testing Hedera Testnet Connection
echo ========================================
echo.
echo This will verify your Hedera credentials
echo and check your account balance.
echo.
pause

npx tsx test-hedera-connection.ts

echo.
pause
