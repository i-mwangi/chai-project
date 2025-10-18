@echo off
echo ========================================
echo Hedera Wallet Connect Installation
echo ========================================
echo.

echo Installing dependencies...
call pnpm install

echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Start development server: pnpm run dev:vite
echo 2. Open http://localhost:3000/app.html
echo 3. Click "Connect Wallet" to test
echo.
echo Supported wallets:
echo - HashPack: https://www.hashpack.app/
echo - Blade: https://bladewallet.io/
echo - Kabila: https://kabila.app/
echo.
echo Documentation: frontend/wallet/README.md
echo.
pause
