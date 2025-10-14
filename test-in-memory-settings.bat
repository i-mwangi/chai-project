@echo off
echo Testing In-Memory Database Mode
echo ================================
echo.
echo Setting DISABLE_INVESTOR_KYC=true to enable in-memory mode...
echo.

set DISABLE_INVESTOR_KYC=true
tsx test-in-memory-settings.ts

echo.
echo Test complete!
pause
