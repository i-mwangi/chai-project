@echo off
REM Deploy all Chai Platform contracts to Hedera
REM Make sure your .env file is configured with HEDERA_OPERATOR_ID and HEDERA_OPERATOR_KEY

echo ========================================
echo Chai Platform - Hedera Deployment
echo ========================================
echo.

REM Check if .env file exists
if not exist ".env" (
    echo ERROR: .env file not found!
    echo Please copy .env.example to .env and configure your Hedera credentials.
    pause
    exit /b 1
)

echo Step 1: Deploying Independent Contracts
echo ========================================
echo.

echo Deploying PriceOracle...
call pnpm run deploy PriceOracle
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to deploy PriceOracle
    pause
    exit /b 1
)
echo.

echo Deploying TempUSDC (test token)...
call pnpm run deploy TempUSDC
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to deploy TempUSDC
    pause
    exit /b 1
)
echo.

echo Deploying Lender...
call pnpm run deploy Lender
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to deploy Lender
    pause
    exit /b 1
)
echo.

echo Step 2: Compiling Coffee Platform Contracts
echo ========================================
echo.

call compile-contracts.bat
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to compile contracts
    pause
    exit /b 1
)
echo.

echo Step 3: Deploying Coffee Platform Contracts
echo ========================================
echo.

echo Deploying FarmerVerification...
call pnpm run deploy FarmerVerification
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to deploy FarmerVerification
    pause
    exit /b 1
)
echo.

echo Deploying CoffeeTreeManager...
call pnpm run deploy CoffeeTreeManager
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to deploy CoffeeTreeManager
    pause
    exit /b 1
)
echo.

echo Deploying CoffeeTreeMarketplace...
call pnpm run deploy CoffeeTreeMarketplace
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to deploy CoffeeTreeMarketplace
    pause
    exit /b 1
)
echo.

echo Deploying CoffeeRevenueReserve...
call pnpm run deploy CoffeeRevenueReserve
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to deploy CoffeeRevenueReserve
    pause
    exit /b 1
)
echo.

echo Deploying CoffeeTreeIssuer (main contract)...
call pnpm run deploy CoffeeTreeIssuer
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to deploy CoffeeTreeIssuer
    pause
    exit /b 1
)
echo.

echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Check shared.json for deployed contract IDs
echo 2. Update your .env file with the contract addresses
echo 3. Initialize the database: pnpm run init-db
echo 4. Start the indexers: pnpm run index
echo 5. Test the deployment: pnpm run test:e2e
echo.
echo View your contracts on HashScan:
echo https://hashscan.io/testnet/
echo.
pause
