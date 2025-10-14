@echo off
echo ========================================
echo Running User Settings Service Unit Tests
echo ========================================
echo.

npx tsx --test tests/Unit/user-settings.spec.ts

echo.
echo ========================================
echo Test Execution Complete
echo ========================================
