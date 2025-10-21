@echo off
REM Compile Solidity contracts for Hedera deployment
REM Usage: compile-contracts.bat [ContractName]
REM If no contract name provided, compiles all coffee platform contracts

if "%1"=="" (
    echo Compiling all coffee platform contracts...
    call :compile FarmerVerification
    call :compile CoffeeTreeManager
    call :compile CoffeeTreeMarketplace
    call :compile CoffeeRevenueReserve
    call :compile CoffeeTreeIssuer
    echo.
    echo All contracts compiled successfully!
    goto :end
) else (
    call :compile %1
    goto :end
)

:compile
set CONTRACT_NAME=%1
set CONTRACT_PATH=contracts\%CONTRACT_NAME%.sol
set OUTPUT_DIR=abi
set OUTPUT_PATH=%OUTPUT_DIR%\%CONTRACT_NAME%.json

if not exist "%CONTRACT_PATH%" (
    echo Error: File not found: %CONTRACT_PATH%
    exit /b 1
)

echo Compiling %CONTRACT_NAME%...

REM Ensure the abi folder exists
if not exist "%OUTPUT_DIR%" mkdir "%OUTPUT_DIR%"

REM Compile using solc
npx solc --optimize --combined-json abi,bin "%CONTRACT_PATH%" > temp_output.json

REM Extract the specific contract using Node.js
node -e "const fs=require('fs');const data=JSON.parse(fs.readFileSync('temp_output.json','utf8'));const key='%CONTRACT_PATH%:%CONTRACT_NAME%';const contract=data.contracts[key];if(contract){fs.writeFileSync('%OUTPUT_PATH%',JSON.stringify(contract,null,2));}else{console.error('Contract not found in output');process.exit(1);}"

if %ERRORLEVEL% NEQ 0 (
    echo Error compiling %CONTRACT_NAME%
    del temp_output.json 2>nul
    exit /b 1
)

del temp_output.json
echo Compiled %CONTRACT_NAME% successfully - saved to %OUTPUT_PATH%
echo.
exit /b 0

:end
