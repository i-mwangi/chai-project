@echo off
echo ========================================
echo Grove Tracker Debug
echo ========================================
echo.
echo Step 1: Testing simple Mapbox connection...
echo Opening test-mapbox-simple.html
echo.
start http://localhost:3000/test-mapbox-simple.html
timeout /t 3 /nobreak >nul
echo.
echo Step 2: Opening Grove Tracker with debug logging...
echo Check browser console (F12) for debug messages
echo.
start http://localhost:3000/grove-tracker.html
echo.
echo ========================================
echo Debug Instructions:
echo ========================================
echo.
echo 1. First window (test-mapbox-simple.html):
echo    - Should show "Map loaded successfully!" in green
echo    - Should show a map with a red marker on Nairobi
echo    - If this works, Mapbox credentials are correct
echo.
echo 2. Second window (grove-tracker.html):
echo    - Press F12 to open Developer Console
echo    - Look for console messages:
echo      * "DOM loaded, initializing Grove Tracker..."
echo      * "Mapbox GL JS loaded: true"
echo      * "Map instance created"
echo      * "Map loaded successfully!"
echo.
echo 3. Common Issues:
echo    - If test works but tracker doesn't: CSS/layout issue
echo    - If neither works: Check internet connection
echo    - If "401 Unauthorized": Token issue
echo    - If "404 Not Found": Style URL issue
echo.
echo 4. Check these in Console:
echo    - Any red error messages
echo    - Network tab for failed requests
echo    - Elements tab to see if #map has height
echo.
pause
