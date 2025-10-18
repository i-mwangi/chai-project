@echo off
echo ========================================
echo HashConnect Setup Verification
echo ========================================
echo.
echo Checking files...
echo.

if exist "frontend\js\hashpack-direct.js" (
    echo [OK] hashpack-direct.js found
) else (
    echo [ERROR] hashpack-direct.js NOT found
)

if exist "frontend\hashconnect-setup.html" (
    echo [OK] hashconnect-setup.html found
) else (
    echo [ERROR] hashconnect-setup.html NOT found
)

if exist "test-hashconnect.bat" (
    echo [OK] test-hashconnect.bat found
) else (
    echo [ERROR] test-hashconnect.bat NOT found
)

echo.
echo Checking app.html for CDN scripts...
findstr /C:"@hashgraph/sdk" frontend\app.html >nul
if %errorlevel%==0 (
    echo [OK] Hedera SDK script found in app.html
) else (
    echo [ERROR] Hedera SDK script NOT found in app.html
)

findstr /C:"hashconnect@3" frontend\app.html >nul
if %errorlevel%==0 (
    echo [OK] HashConnect script found in app.html
) else (
    echo [ERROR] HashConnect script NOT found in app.html
)

findstr /C:"hashpack-direct.js" frontend\app.html >nul
if %errorlevel%==0 (
    echo [OK] hashpack-direct.js loaded in app.html
) else (
    echo [ERROR] hashpack-direct.js NOT loaded in app.html
)

echo.
echo ========================================
echo Verification Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Run: test-hashconnect.bat
echo 2. Install HashPack from: https://www.hashpack.app/
echo 3. Test wallet connection
echo.
pause
