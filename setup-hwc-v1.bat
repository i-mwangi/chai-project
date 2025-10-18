@echo off
echo ========================================
echo Setting up HWC v1 Integration
echo ========================================
echo.

echo Step 1: Clearing npm cache...
npm cache clean --force

echo.
echo Step 2: Installing dependencies...
pnpm install

echo.
echo Step 3: Setup complete!
echo.
echo ========================================
echo Next Steps:
echo ========================================
echo.
echo 1. Update your HTML files to load the new bundled script
echo 2. Run: pnpm run frontend:vite
echo 3. Open http://localhost:3000
echo.
echo See HWC-V1-COMPLETE.md for detailed instructions
echo.
pause
