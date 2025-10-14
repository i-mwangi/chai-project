@echo off
echo ========================================
echo Turso Database Setup for Chai Platform
echo ========================================
echo.

echo Step 1: Installing Turso CLI...
echo Run this command in PowerShell:
echo irm get.turso.tech/install.ps1 ^| iex
echo.
pause

echo.
echo Step 2: Sign up for Turso...
echo Run: turso auth signup
echo.
pause

echo.
echo Step 3: Create database...
echo Run: turso db create chai-platform
echo.
pause

echo.
echo Step 4: Get database URL...
echo Run: turso db show chai-platform --url
echo Copy the URL and save it!
echo.
pause

echo.
echo Step 5: Create auth token...
echo Run: turso db tokens create chai-platform
echo Copy the token and save it!
echo.
pause

echo.
echo Step 6: Update .env file
echo Add these lines to your .env:
echo TURSO_DATABASE_URL=libsql://chai-platform-yourname.turso.io
echo TURSO_AUTH_TOKEN=your-token-here
echo.
pause

echo.
echo Step 7: Run migrations...
echo Run: pnpm run migrate
echo.
pause

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo Your database is ready for production!
echo.
pause
