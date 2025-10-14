@echo off
echo ========================================
echo Testing Harvest Reporting Flow
echo ========================================
echo.

echo Step 1: Checking if better-sqlite3 is installed...
node -e "try { require('better-sqlite3'); console.log('✓ better-sqlite3 is installed'); } catch(e) { console.log('✗ better-sqlite3 NOT installed - will use in-memory DB'); }"
echo.

echo Step 2: Running harvest reporting test...
echo.
node test-harvest-reporting.cjs
echo.

echo ========================================
echo Test Complete
echo ========================================
pause
