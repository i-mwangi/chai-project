@echo off
REM Show all deployed contract IDs from shared.json

echo ========================================
echo Deployed Contract IDs
echo ========================================
echo.

if not exist "shared.json" (
    echo No contracts deployed yet.
    echo Run deploy-all-contracts.bat to deploy.
    pause
    exit /b 0
)

type shared.json
echo.
echo.
echo Copy these IDs to your .env file:
echo ========================================
node -e "const fs=require('fs');const data=JSON.parse(fs.readFileSync('shared.json','utf8'));Object.entries(data).forEach(([key,value])=>{if(value){console.log(key+'='+value);}})"
echo.
pause
