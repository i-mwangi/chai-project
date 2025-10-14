# Chai Platform - Tokenized Coffee Trees on Hedera

## Overview

The Chai Platform is a blockchain-based solution that empowers smallholder coffee farmers in Kenya, Ethiopia, and Uganda by tokenizing coffee trees. Using Hedera Hashgraph technology, the platform provides farmers with immediate capital, promotes sustainable practices, and ensures fair compensation through transparent smart contracts.

### Key Features

The platform enables three primary user experiences:

**For Farmers:**
- Register coffee groves with precise location mapping
- Report harvests with detailed yield and quality data
- Monitor tree health and receive maintenance recommendations
- Track revenue distributions from token sales
- Access immediate capital through tokenization

**For Investors:**
- Browse and invest in coffee groves through token purchases
- Earn revenue from harvest distributions (70/30 investor/farmer split)
- Provide liquidity to lending pools for additional APY (5-12%)
- Take out loans against token holdings without selling
- Trade tokens on a secondary marketplace

**For Admins:**
- Manage token creation, minting, and burning
- Approve KYC verification for participants
- Monitor platform activity and distributions
- Oversee lending pools and loan repayments

### Technology Stack

- **Blockchain**: Hedera Hashgraph for fast, low-cost transactions
- **Smart Contracts**: Solidity contracts deployed on Hedera
- **Frontend**: Vanilla HTML/CSS/JavaScript for performance
- **Backend**: Node.js with TypeScript
- **Database**: SQLite with Drizzle ORM
- **Wallet Integration**: HashPack wallet support

### New Features (Version 2.0)

The platform now includes comprehensive DeFi features:

- **Revenue Distribution System**: Automated distribution of harvest revenue to token holders with 70/30 investor/farmer split
- **Lending & Liquidity Pools**: Earn APY by providing liquidity or borrow against your coffee tree tokens
- **Advanced Pricing Oracle**: Variety-specific and seasonal pricing for accurate harvest valuations
- **Token Management**: Admin tools for minting, burning, and KYC management
- **Real-time Balance Updates**: Live portfolio tracking with 30-second cache refresh
- **Transaction History**: Complete audit trail of all platform activities

For detailed information about these features, see:
- [API Documentation](./API_DOCUMENTATION.md) - Complete API reference
- [User Guide](./USER_GUIDE.md) - Step-by-step feature guides
- [Hedera Testnet Setup](./HEDERA_TESTNET_SETUP_GUIDE.md) - Test on Hedera testnet
- [Quick Start Guide](./HEDERA_QUICK_START.md) - Get started in 5 minutes

## Additional Documentation

For more detailed information about specific components of the platform, please refer to the following documentation files:

### Core Platform Documentation
- [Admin Endpoints Implementation](./ADMIN_ENDPOINTS_IMPLEMENTATION.md) - Detailed implementation of admin functionality
- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md) - Step-by-step deployment checklist
- [Deployment Preparation Report](./DEPLOYMENT_PREPARATION_REPORT.md) - Pre-deployment requirements and setup
- [Farmer Verification Guide](./FARMER_VERIFICATION_GUIDE.md) - Farmer onboarding and verification process
- [Investor Verification Guide](./INVESTOR_VERIFICATION_GUIDE.md) - Investor onboarding and verification process
- [Investor Verification Schema Summary](./investor-verification-schema-summary.md) - Database schema for investor verification
- [Troubleshooting Guide](./TROUBLESHOOTING.md) - Common issues and solutions
- [Your Hedera Setup](./YOUR_HEDERA_SETUP.md) - Personal Hedera configuration guide

### Component-Specific Documentation
- [API README](./api/README.md) - Backend API services and endpoints
- [Frontend README](./frontend/README.md) - Frontend architecture and development guide
- [Frontend Quickstart](./FRONTEND_QUICKSTART.md) - Fast track guide to running the frontend
- [E2E Testing Guide](./tests/E2E_TESTING_README.md) - End-to-end testing procedures and setup

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- pnpm package manager
- A modern web browser
- **For Hedera Integration**: A Hedera testnet account (optional, only needed for real blockchain features)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd chai-project
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. **Optional**: For Hedera integration, set up your environment:
   ```bash
   test-on-hedera.bat
   ```
   Then edit the `.env` file with your Hedera testnet credentials.

### Running the Project

There are several ways to run the Coffee Platform depending on your needs:

#### Option 1: Quick Demo (Mock Data) - Recommended for New Users

The easiest way to start the project is by using the provided batch script:

```bash
start-demo.bat
```

This will:
1. Start the Mock API Server on port 3002
2. Start the Frontend Server on port 3000
3. Automatically open your browser to the landing page

This option requires no Hedera setup and uses mock data for demonstration purposes.

#### Option 2: Using npm Scripts (Cross-platform)

For developers who prefer using npm scripts (works on Windows, macOS, and Linux):

1. **Start both frontend and mock API server** (recommended for development):
   ```bash
   npm run dev
   ```
   This command starts both the frontend server (port 3000) and mock API server (port 3002) simultaneously.

2. **Start frontend server only**:
   ```bash
   npm run frontend
   ```
   or
   ```bash
   node frontend/server.js
   ```
   The frontend server will run on port 3000.

3. **Start API server**:
   - For mock API:
     ```bash
     npm run api:mock
     ```
     or
     ```bash
     node frontend/api-server.js
     ```
     The mock API server will run on port 3002.
   - For full API with Hedera integration:
     ```bash
     npm run api
     ```
     or
     ```bash
     npx tsx api/server.ts
     ```
     The full API server will run on port 3001.

#### Option 3: Hedera Testnet (Real Blockchain)

To test with real Hedera testnet:

1. **Initial Setup** (first time only):
   ```bash
   test-on-hedera.bat
   ```
   This script will:
   - Create a .env file from the template
   - Install dependencies
   - Run database migrations
   - Build TypeScript files

2. **Configure Hedera Credentials**:
   - Get testnet credentials: https://portal.hedera.com/
   - Get testnet HBAR: https://portal.hedera.com/faucet
   - Edit `.env` with your credentials

3. **Start with Hedera**:
   ```bash
   start-hedera-testnet.bat
   ```

4. **Connect HashPack wallet** (set to testnet mode)

See [HEDERA_QUICK_START.md](./HEDERA_QUICK_START.md) for detailed instructions.

#### Manual Start

If you prefer to start the services manually:

1. Start the API server:
   ```bash
   # Mock API (no Hedera needed) - runs on port 3002
   node frontend/api-server.js
   
   # OR Real Hedera API (requires setup) - runs on port 3001
   npx tsx api/server.ts
   ```

2. In a new terminal, start the frontend server:
   ```bash
   node frontend/server.js
   ```
   The frontend server will run on port 3000.

3. Open your browser and visit `http://localhost:3000`

### Server Port Configuration

The Chai Platform uses the following port configuration:
- **Frontend Server**: Port 3000
- **Mock API Server**: Port 3002
- **Full API Server**: Port 3001

### Accessing the Application

Once the servers are running, you can access the application at:
- **Frontend**: http://localhost:3000
- **Mock API Health Check**: http://localhost:3002/health
- **Full API Health Check**: http://localhost:3001/health

### Navigating the Application

1. **Landing Page**: Visit `http://localhost:3000` to see the main landing page
2. **Main Application**: Click "Sign Up" or "Get Started" buttons to navigate to `http://localhost:3000/app.html`
3. **Farmer Portal**: Connect wallet as farmer in the main app
   - Report harvests with advanced pricing
   - Withdraw revenue shares
   - Monitor tree health
4. **Investor Portal**: Connect wallet as investor in the main app
   - Browse and purchase grove tokens
   - Claim earnings from distributions
   - Provide liquidity to lending pools
   - Take loans against token holdings
5. **Admin Panel**: Connect with admin wallet to access token management
   - Mint/burn tokens
   - Grant/revoke KYC
   - Monitor distributions and loans

For detailed usage instructions, see the [User Guide](./USER_GUIDE.md).

### Testing

The project includes comprehensive tests to ensure functionality:

- **Unit Tests**: `npm test`
- **End-to-End Tests**: `npm run test:e2e`
- **Integration Tests**: `npm run test:e2e:integration`
- **Performance Tests**: `npm run test:e2e:load`

### Project Structure

```
chai-project/
├── abi/                    # Smart contract ABIs
├── api/                    # Backend API services
├── contracts/              # Solidity smart contracts
├── db/                     # Database migrations and schema
├── events/                 # Event indexing services
├── frontend/               # Web frontend (HTML, CSS, JavaScript)
├── lib/                    # Shared libraries
├── providers/              # Data providers and services
├── tests/                  # Unit and integration tests
├── types/                  # TypeScript type definitions
├── package.json            # Project dependencies and scripts
└── README.md               # This file
```

This project on the Hedera blockchain consists of two main modules:

- **Issuer:** Manages the creation and lifecycle of tokenized assets.
- **Lender:** Handles lending pools, liquidity, and the issuance/repayment of loans.

Both modules integrate with Hedera Token Service (HTS) for token operations and use a `PriceOracle` for asset pricing.

---

## Coffee Tree Issuer Module

The **CoffeeTreeIssuer** contract is responsible for managing tokenized coffee groves. It includes the following functionality:

### Key Responsibilities

- **Coffee Grove Registration:**  
  - `registerCoffeeGrove(string memory _groveName, string memory _location, uint64 _treeCount, string memory _coffeeVariety, uint64 _expectedYieldPerTree)`  
    Registers a new coffee grove with metadata including location, tree count, coffee variety, and expected yield per tree.

- **Coffee Grove Tokenization:**  
  - `tokenizeCoffeeGrove(string memory groveName, uint64 totalTokens, uint64 tokensPerTree)`  
    Tokenizes a registered coffee grove by creating fungible tokens representing ownership shares. Deploys a `CoffeeTreeManager` contract and an associated `CoffeeRevenueReserve`.

- **Token Management:**  
  - `mint(string memory groveName, uint64 amount)`  
    Mints a specified amount of tokens for a coffee grove.
  - `burn(string memory groveName, uint64 amount)`  
    Burns a specified amount of tokens.
  - `grantKYC(string memory groveName, address account)`  
    Grants KYC clearance to an account, enabling participation in coffee grove token transactions.

- **Coffee Grove Trading:**  
  - `purchaseCoffeeGroveTokens(string memory groveName, uint64 amount)`  
    Allows users to purchase coffee grove tokens. It calculates the total cost using the price from the `PriceOracle`, transfers USDC from the buyer to the reserve, and then airdrops tokens to the buyer.
  - `sellCoffeeGroveTokens(string memory groveName, uint64 suppliedAssets)`  
    Enables users to sell their coffee grove tokens back to the contract. The process involves transferring tokens from the seller, refunding USDC from the reserve, and handling collateral withdrawals.

### Events

- **CoffeeGroveRegistered:**  
  Emitted when a coffee grove is registered, logging the grove name, farmer address, tree count, location, and coffee variety.
- **CoffeeGroveTokenized:**  
  Emitted when a coffee grove is tokenized, logging the grove name, token address, total tokens, and tokens per tree.
- **TreeTokensPurchased:**  
  Emitted when coffee grove tokens are purchased, logging the grove address, amount, investor address, and total cost.
- **TreeTokensSold:**  
  Emitted when coffee grove tokens are sold, logging the grove address, amount, seller address, and refund amount.

---

## Coffee Tree Lender Module

The **Lender** contract manages lending pools and related loan functionalities for coffee tree investments.

### Key Responsibilities

- **Lending Pool Management:**  
  - `addLenderPool(address asset, string memory lender_token_name, string memory lender_token_symbol)`  
    Deploys a new `LendingTokenReserve` contract for the specified coffee grove token. This reserve will handle token minting, liquidity, and collateral management.
  - `getLpTokenAddress(address asset)` and `getReserveAddress(address asset)`  
    Provide lookup functions for the lending pool token and reserve contract addresses for coffee grove tokens.

- **Liquidity Provision:**  
  - `provideLiquidity(address asset, uint64 amount)`  
    Allows users to deposit USDC into the lending pool for coffee tree investments. USDC is transferred from the user to the reserve, and the reserve mints and airdrops lending tokens to the user.
  - `withdrawLiquidity(address asset, uint64 amount)`  
    Enables users to withdraw their liquidity from coffee tree investment pools. Tokens are transferred back to the reserve, which burns them and returns USDC to the user. (Note: Reward distribution is a planned enhancement.)

- **Coffee Tree Investment Loans:**  
  - `takeOutLoan(address asset, uint64 amount)`  
    Lets users take out a loan by:
    - Calculating the required collateral using a 125% collateralization ratio.
    - Determining a liquidation price (90% of the coffee grove token's USDC price).
    - Computing the repayment amount (110% of the loan amount).
    - Transferring collateral from the borrower to the reserve.
    - Issuing the loan amount in USDC and recording the loan details.

- **Loan Repayment:**  
  - `repayOutstandingLoan(address asset)`  
    Handles loan repayment by transferring the USDC repayment from the borrower, refunding the locked coffee grove token collateral, and updating the loan's status as repaid.

### Internal Mechanics in LendingTokenReserve

The `LendingTokenReserve` contract (instantiated within the Lender module) handles:

- **Token Operations:**  
  Minting and burning of reserve tokens, airdropping tokens to liquidity providers, and managing token associations via HTS for coffee tree investments.
  
- **Loan Record Keeping:**  
  Maintains a mapping of active loans with details such as the loan amount, coffee grove token collateral amount, liquidation price, and repayment amount. Functions are provided to record, liquidate, and repay loans.

- **Asset and USDC Transfers:**  
  Leverages HTS functions to handle the transfer of USDC and coffee grove tokens, ensuring that all transfers are validated against Hedera's response codes.

---

## Integration with Hedera Token Service (HTS)

Both coffee tree modules heavily rely on HTS for:

- Creating fungible tokens for coffee grove ownership.
- Minting and burning coffee grove tokens.
- Transferring tokens (USDC, coffee grove tokens, lending pool tokens).
- Airdropping coffee grove tokens to investors.

These interactions ensure that all coffee tree investment operations are compliant with Hedera's standards and that token transfers are secure and reliable.

--------


# Frontend Integration Guide

This document outlines the steps for integrating coffee tree tokenization smart contracts on the frontend. It focuses on user interactions where the user acts as a farmer, investor, or admin.

---

## Coffee Tree Issuer Module

### 1. Request KYC Verification for Coffee Grove Investment

**Purpose:**  
Allow the admin to grant KYC so that users can trade coffee grove tokens.

**User Flow:**  
- **Admin Action:** Trigger a transaction that calls `grantKYC` with the target user's address and coffee grove name.

**Example Code:**

```javascript
import { ContractExecuteTransaction, ContractFunctionParameters } from "@hashgraph/sdk";

async function grantKYCForCoffeeGrove(userAddress, groveName) {
  const contractId = "0.0.xxxx"; // CoffeeTreeIssuer contract ID
  const tx = new ContractExecuteTransaction()
    .setContractId(contractId)
    .setGas(4_000_000)
    .setFunction("grantKYC", new ContractFunctionParameters()
      .addString(groveName)
      .addAddress(userAddress)
    );
  const signedTx = await tx.freezeWith(client).sign(adminPrivateKey); // Admin signs
  const txResponse = await signedTx.execute(client);
  const receipt = await txResponse.getReceipt(client);
  console.log("KYC status for coffee grove investment:", receipt.status.toString());
}
```

---

### 2. Associate Coffee Grove Token

**Purpose:**  
Users must associate their account with a coffee grove token before holding or trading it.

**User Flow:**  
- **Action:** The user connects their wallet and initiates token association for a coffee grove.

**Example Code:**

```
import { TokenAssociateTransaction, TokenId } from "@hashgraph/sdk";

async function associateCoffeeGroveToken(tokenAddress, userAccountId, userPrivateKey) {
  const tx = new TokenAssociateTransaction()
    .setTokenIds([TokenId.fromSolidityAddress(tokenAddress)])
    .setAccountId(userAccountId);
  const signedTx = await tx.freezeWith(client).sign(userPrivateKey);
  const txResponse = await signedTx.execute(client);
  const receipt = await txResponse.getReceipt(client);
  console.log("Coffee grove token association status:", receipt.status.toString());
}
```

---

### 3. Purchase Coffee Grove Tokens

**Purpose:**  
Users can purchase coffee grove tokens by sending USDC to the reserve and receiving the tokens in return.

**User Flow:**  
- **Action:** The user initiates a purchase transaction via their connected wallet for coffee grove tokens.

**Example Code:**

```
import { ContractExecuteTransaction, ContractFunctionParameters, Hbar } from "@hashgraph/sdk";

async function purchaseCoffeeGroveTokens(groveName, tokenAmount, userPrivateKey) {
  const contractId = "0.0.xxxx"; // CoffeeTreeIssuer contract ID
  const tx = new ContractExecuteTransaction()
    .setContractId(contractId)
    .setGas(4_000_000)
    .setFunction("purchaseCoffeeGroveTokens", new ContractFunctionParameters()
      .addString(groveName)
      .addUint64(tokenAmount) // Purchase specified number of tokens
    )
    .setPayableAmount(new Hbar(0)); // If needed
  const signedTx = await tx.freezeWith(client).sign(userPrivateKey); // User signs
  const txResponse = await signedTx.execute(client);
  const receipt = await txResponse.getReceipt(client);
  console.log("Coffee grove token purchase status:", receipt.status.toString());
}
```

---

### 4. Sell Coffee Grove Tokens

**Purpose:**  
Enable users to sell their coffee grove tokens back to the contract in exchange for USDC.

**User Flow:**  
- **Action:** The user signs a transaction to sell coffee grove tokens.

**Example Code:**

```
import { ContractExecuteTransaction, ContractFunctionParameters } from "@hashgraph/sdk";

async function sellCoffeeGroveTokens(groveName, tokenAmount, userPrivateKey) {
  const contractId = "0.0.xxxx"; // CoffeeTreeIssuer contract ID
  const tx = new ContractExecuteTransaction()
    .setContractId(contractId)
    .setGas(4_000_000)
    .setFunction("sellCoffeeGroveTokens", new ContractFunctionParameters()
      .addString(groveName)
      .addUint64(tokenAmount) // Sell specified number of tokens
    );
  const signedTx = await tx.freezeWith(client).sign(userPrivateKey); // User signs
  const txResponse = await signedTx.execute(client);
  const receipt = await txResponse.getReceipt(client);
  console.log("Coffee grove token sell status:", receipt.status.toString());
}
```

---

## Coffee Tree Lender Module

### 1. Associate LP Tokens for Coffee Grove Investments

**Purpose:**  
Before interacting with the lending pool for coffee grove investments, users must associate their account with the LP token.

**User Flow:**  
- **Action:** The user initiates a token association transaction for the LP token related to coffee grove investments.

**Example Code:**

```
import { TokenAssociateTransaction, TokenId } from "@hashgraph/sdk";

async function associateCoffeeGroveLPTokens(lpTokenSolidityAddress, userAccountId, userPrivateKey) {
  const lpTokenId = TokenId.fromSolidityAddress(lpTokenSolidityAddress);
  const tx = new TokenAssociateTransaction()
    .setTokenIds([lpTokenId])
    .setAccountId(userAccountId);
  const signedTx = await tx.freezeWith(client).sign(userPrivateKey);
  const txResponse = await signedTx.execute(client);
  const receipt = await txResponse.getReceipt(client);
  console.log("Coffee grove LP Token Association Status:", receipt.status.toString());
}
```

---

### 2. Approve Lending (USDC Spending) for Coffee Grove Investments

**Purpose:**  
Users need to approve the contract to spend USDC on their behalf before providing liquidity for coffee grove investments.

**User Flow:**  
- **Action:** The user approves a USDC allowance for the lending contract for coffee grove investments.

**Example Code:**

```
import { AccountAllowanceApproveTransaction, TokenAllowance, TokenId, AccountId } from "@hashgraph/sdk";
import Long from "long";

async function approveCoffeeGroveLendingUSDC(usdcTokenId, userAccountId, spenderContractId, userPrivateKey) {
  const tx = new AccountAllowanceApproveTransaction({
    tokenApprovals: [
      new TokenAllowance({
        tokenId: usdcTokenId,
        ownerAccountId: userAccountId,
        spenderAccountId: AccountId.fromString(spenderContractId),
        amount: Long.fromNumber(1_000 * 1_000_000) // e.g., 1000 USDC
      })
    ]
  });
  const signedTx = await tx.freezeWith(client).sign(userPrivateKey);
  const txResponse = await signedTx.execute(client);
  const receipt = await txResponse.getReceipt(client);
  console.log("Coffee grove USDC Allowance Status:", receipt.status.toString());
}
```

---

### 3. Provide Liquidity for Coffee Grove Investments

**Purpose:**  
Users deposit USDC into the lending pool for coffee grove investments and receive LP tokens.

**User Flow:**  
- **Action:** The user signs a transaction to provide liquidity for coffee grove investments.

**Example Code:**

```
import { ContractExecuteTransaction, ContractFunctionParameters, Hbar } from "@hashgraph/sdk";

async function provideCoffeeGroveLiquidity(groveTokenAddress, liquidityAmount, userPrivateKey) {
  const lenderContractId = "0.0.xxxx"; // Lender contract ID
  const tx = new ContractExecuteTransaction()
    .setContractId(lenderContractId)
    .setFunction("provideLiquidity", new ContractFunctionParameters()
      .addAddress(groveTokenAddress)
      .addUint64(liquidityAmount) // Amount in micro USDC
    )
    .setGas(3_000_000);
  const signedTx = await tx.freezeWith(client).sign(userPrivateKey);
  const txResponse = await signedTx.execute(client);
  const receipt = await txResponse.getReceipt(client);
  console.log("Provide Coffee Grove Liquidity Status:", receipt.status.toString());
}
```

---

### 4. Approve Contract to Spend Coffee Grove Tokens

**Purpose:**  
Users allow the lending contract to spend a specified amount of coffee grove tokens for loan-related operations.

**User Flow:**  
- **Action:** The user approves an allowance for coffee grove tokens.

**Example Code:**

```
import { AccountAllowanceApproveTransaction, TokenAllowance, TokenId, AccountId } from "@hashgraph/sdk";
import Long from "long";

async function approveCoffeeGroveTokenSpending(groveTokenId, userAccountId, spenderContractId, userPrivateKey, amount) {
  const tx = new AccountAllowanceApproveTransaction({
    tokenApprovals: [
      new TokenAllowance({
        tokenId: groveTokenId,
        ownerAccountId: userAccountId,
        spenderAccountId: AccountId.fromString(spenderContractId),
        amount: Long.fromNumber(amount)
      })
    ]
  });
  const signedTx = await tx.freezeWith(client).sign(userPrivateKey);
  const txResponse = await signedTx.execute(client);
  const receipt = await txResponse.getReceipt(client);
  console.log("Coffee Grove Token Spending Allowance Status:", receipt.status.toString());
}
```

---

### 5. Take Out a Loan Against Coffee Grove Tokens

**Purpose:**  
Users lock up collateral (coffee grove tokens) to obtain a USDC loan from the lending pool.

**User Flow:**  
- **Action:** The user initiates a loan by signing the transaction with coffee grove tokens as collateral.

**Example Code:**

```
import { ContractExecuteTransaction, ContractFunctionParameters } from "@hashgraph/sdk";

async function takeOutCoffeeGroveLoan(groveTokenAddress, loanAmount, userPrivateKey) {
  const lenderContractId = "0.0.xxxx"; // Lender contract ID
  const tx = new ContractExecuteTransaction()
    .setContractId(lenderContractId)
    .setFunction("takeOutLoan", new ContractFunctionParameters()
      .addAddress(groveTokenAddress)
      .addUint64(loanAmount) // Loan amount in micro USDC
    )
    .setGas(3_000_000);
  const signedTx = await tx.freezeWith(client).sign(userPrivateKey);
  const txResponse = await signedTx.execute(client);
  const receipt = await txResponse.getReceipt(client);
  console.log("Take Out Coffee Grove Loan Status:", receipt.status.toString());
}
```

---

### 6. Add Allowance for Loan Repayment

**Purpose:**  
Before repaying a loan, users must approve the contract to spend the required USDC for repayment.

**User Flow:**  
- **Action:** The user approves a USDC allowance for loan repayment.

**Example Code:**

```
import { AccountAllowanceApproveTransaction, TokenAllowance, TokenId, AccountId } from "@hashgraph/sdk";
import Long from "long";

async function addCoffeeGroveRepaymentAllowance(usdcTokenId, userAccountId, spenderContractId, userPrivateKey, repaymentAmount) {
  const tx = new AccountAllowanceApproveTransaction({
    tokenApprovals: [
      new TokenAllowance({
        tokenId: usdcTokenId,
        ownerAccountId: userAccountId,
        spenderAccountId: AccountId.fromString(spenderContractId),
        amount: Long.fromNumber(repaymentAmount)
      })
    ]
  });
  const signedTx = await tx.freezeWith(client).sign(userPrivateKey);
  const txResponse = await signedTx.execute(client);
  const receipt = await txResponse.getReceipt(client);
  console.log("Coffee Grove Repayment Allowance Status:", receipt.status.toString());
}
```

---

### 7. Repay a Loan for Coffee Grove Investment

**Purpose:**  
Users repay their outstanding loan to unlock their coffee grove token collateral.

**User Flow:**  
- **Action:** The user signs a transaction to repay the loan, triggering the collateral refund of coffee grove tokens.

**Example Code:**

```
import { ContractExecuteTransaction, ContractFunctionParameters } from "@hashgraph/sdk";

async function repayCoffeeGroveLoan(groveTokenAddress, userPrivateKey) {
  const lenderContractId = "0.0.xxxx"; // Lender contract ID
  const tx = new ContractExecuteTransaction()
    .setContractId(lenderContractId)
    .setFunction("repayOutstandingLoan", new ContractFunctionParameters()
      .addAddress(groveTokenAddress)
    )
    .setGas(3_000_000);
  const signedTx = await tx.freezeWith(client).sign(userPrivateKey);
  const txResponse = await signedTx.execute(client);
  const receipt = await txResponse.getReceipt(client);
  console.log("Repay Coffee Grove Loan Status:", receipt.status.toString());
}
```

---

## Best Practices for Coffee Tree Tokenization

- **Wallet Integration:**  
  Use secure wallet integrations (like HashPack) to sign transactions instead of exposing private keys directly in the frontend.

- **User Role Separation:**  
  Maintain separate flows for farmers, investors, and admin actions. Each should use its own client instance or wallet provider.

- **Error Handling:**  
  Ensure robust error handling in your UI to inform users of any transaction failures related to coffee grove investments.

- **Gas Estimation:**  
  Dynamically estimate gas limits to avoid over- or under-provisioning for coffee tree tokenization transactions.
