@echo off
echo Fixing npm installation issue...
echo.

echo Step 1: Clearing npm cache...
npm cache clean --force

echo.
echo Step 2: Installing packages...
pnpm install

echo.
echo Done! If this still fails, run: delete-node-modules.bat
pause
