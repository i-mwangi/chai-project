@echo off
echo ========================================
echo Grove Tracker Section Inserter
echo ========================================
echo.
echo This will insert the Grove Tracker section into index.html
echo between "Our Solution" and "Platform Technology"
echo.
echo A backup will be created automatically.
echo.
pause
echo.
echo Running PowerShell script...
echo.
powershell -ExecutionPolicy Bypass -File insert-grove-tracker.ps1
echo.
pause
