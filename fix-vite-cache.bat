@echo off
echo ========================================
echo Fixing Vite Cache Issues
echo ========================================
echo.

echo Step 1: Clearing Vite cache...
if exist "node_modules\.vite" (
    rmdir /s /q "node_modules\.vite"
    echo ✓ Vite cache cleared
) else (
    echo ✓ No Vite cache found
)

echo.
echo Step 2: Clearing node_modules...
if exist "node_modules" (
    echo This may take a moment...
    rmdir /s /q "node_modules"
    echo ✓ node_modules cleared
) else (
    echo ✓ No node_modules found
)

echo.
echo Step 3: Reinstalling dependencies...
call pnpm install

echo.
echo ========================================
echo Fix Complete!
echo ========================================
echo.
echo Now run: pnpm run dev:vite
echo.
pause
