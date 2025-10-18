@echo off
echo WARNING: This will delete node_modules and reinstall everything
echo This may take several minutes...
echo.
pause

echo Deleting node_modules...
rmdir /s /q node_modules

echo Deleting lock files...
del /f /q package-lock.json 2>nul
del /f /q pnpm-lock.yaml 2>nul

echo.
echo Clearing npm cache...
npm cache clean --force

echo.
echo Reinstalling with pnpm...
pnpm install

echo.
echo Done!
pause
