@echo off
echo ========================================
echo Task 12: Integration Testing Verification
echo ========================================
echo.

echo Checking test files...
echo.

if exist "test-integration-validation.html" (
    echo [OK] test-integration-validation.html found
) else (
    echo [ERROR] test-integration-validation.html not found
    exit /b 1
)

if exist "test-integration-validation.js" (
    echo [OK] test-integration-validation.js found
) else (
    echo [ERROR] test-integration-validation.js not found
    exit /b 1
)

if exist "TASK-12-INTEGRATION-TESTING-GUIDE.md" (
    echo [OK] TASK-12-INTEGRATION-TESTING-GUIDE.md found
) else (
    echo [ERROR] TASK-12-INTEGRATION-TESTING-GUIDE.md not found
    exit /b 1
)

if exist "TASK-12-COMPLETE.md" (
    echo [OK] TASK-12-COMPLETE.md found
) else (
    echo [ERROR] TASK-12-COMPLETE.md not found
    exit /b 1
)

if exist "TASK-12-QUICK-START.md" (
    echo [OK] TASK-12-QUICK-START.md found
) else (
    echo [ERROR] TASK-12-QUICK-START.md not found
    exit /b 1
)

echo.
echo ========================================
echo All test files verified successfully!
echo ========================================
echo.
echo To run the test suite:
echo 1. npm run frontend:vite
echo 2. Open http://localhost:3000/test-integration-validation.html
echo.
echo See TASK-12-QUICK-START.md for quick start guide
echo See TASK-12-INTEGRATION-TESTING-GUIDE.md for full documentation
echo.

pause
