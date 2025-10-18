@echo off
echo ========================================
echo Register Grove Button - Quick Fix
echo ========================================
echo.
echo PROBLEM: Register Grove button not responding
echo.
echo SOLUTION: Set user type to "farmer"
echo.
echo ========================================
echo STEPS:
echo ========================================
echo.
echo 1. Open your app in browser:
echo    http://localhost:5173/app.html
echo.
echo 2. Connect your wallet
echo.
echo 3. Navigate to "Farmer Portal"
echo.
echo 4. Press F12 to open browser console
echo.
echo 5. Copy and paste this command:
echo.
echo    window.walletManager.userType = 'farmer';
echo.
echo 6. Press Enter
echo.
echo 7. Click "Register New Grove" button again
echo.
echo ========================================
echo ALTERNATIVE: Use Diagnostic Tool
echo ========================================
echo.
echo Open this file in your browser:
echo    test-register-button-simple.html
echo.
echo Then click "Full Diagnostic" button
echo.
echo ========================================
echo.
pause
