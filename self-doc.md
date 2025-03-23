# Project Documentation

## Overview

This project on the Hedera blockchain consists of two main modules:

- **Issuer:** Manages the creation and lifecycle of tokenized assets.
- **Lender:** Handles lending pools, liquidity, and the issuance/repayment of loans.

Both modules integrate with Hedera Token Service (HTS) for token operations and use a `PriceOracle` for asset pricing.

---

## Issuer Module

The **Issuer** contract is responsible for managing tokenized assets. It includes the following functionality:

### Key Responsibilities

- **Asset Creation:**  
  - `createTokenizedAsset(string memory _name, string memory _symbol)`  
    Creates a new tokenized asset by deploying a `TokenizedAssetManager` contract and an associated `AssetCollateralReserve`. The asset is initialized with a name and symbol, and any ETH sent is forwarded to the new contract.

- **Token Management:**  
  - `mint(string memory name, uint64 amount)`  
    Mints a specified amount of tokens for the asset.
  - `burn(string memory name, uint64 amount)`  
    Burns a specified amount of tokens.
  - `grantKYC(string memory name, address account)`  
    Grants KYC clearance to an account, enabling participation in asset transactions.

- **Asset Trading:**  
  - `purchaseAsset(string memory name, uint64 amount)`  
    Allows users to purchase assets. It calculates the total cost using the price from the `PriceOracle`, transfers USDC from the buyer to the reserve, and then airdrops tokens to the buyer.
  - `sellAsset(string memory name, uint64 suppliedAssets)`  
    Enables users to sell their assets back to the contract. The process involves transferring tokens from the seller, refunding USDC from the reserve, and handling collateral withdrawals.

### Events

- **AssetPurchased:**  
  Emitted when an asset is purchased, logging the asset name, amount, and buyer address.
- **AssetSold:**  
  Emitted when an asset is sold, logging the asset name, amount, and seller address.

---

## Lender Module

The **Lender** contract manages lending pools and related loan functionalities.

### Key Responsibilities

- **Lending Pool Management:**  
  - `addLenderPool(address asset, string memory lender_token_name, string memory lender_token_symbol)`  
    Deploys a new `LendingTokenReserve` contract for the specified asset. This reserve will handle token minting, liquidity, and collateral management.
  - `getLpTokenAddress(address asset)` and `getReserveAddress(address asset)`  
    Provide lookup functions for the lending pool token and reserve contract addresses.

- **Liquidity Provision:**  
  - `provideLiquidity(address asset, uint64 amount)`  
    Allows users to deposit USDC into the lending pool. USDC is transferred from the user to the reserve, and the reserve mints and airdrops lending tokens to the user.
  - `withdrawLiquidity(address asset, uint64 amount)`  
    Enables users to withdraw their liquidity. Tokens are transferred back to the reserve, which burns them and returns USDC to the user. (Note: Reward distribution is a planned enhancement.)

- **Loan Issuance:**  
  - `takeOutLoan(address asset, uint64 amount)`  
    Lets users take out a loan by:
    - Calculating the required collateral using a 125% collateralization ratio.
    - Determining a liquidation price (90% of the asset’s USDC price).
    - Computing the repayment amount (110% of the loan amount).
    - Transferring collateral from the borrower to the reserve.
    - Issuing the loan amount in USDC and recording the loan details.

- **Loan Repayment:**  
  - `repayOutstandingLoan(address asset)`  
    Handles loan repayment by transferring the USDC repayment from the borrower, refunding the locked collateral, and updating the loan’s status as repaid.

### Internal Mechanics in LendingTokenReserve

The `LendingTokenReserve` contract (instantiated within the Lender module) handles:

- **Token Operations:**  
  Minting and burning of reserve tokens, airdropping tokens to liquidity providers, and managing token associations via HTS.
  
- **Loan Record Keeping:**  
  Maintains a mapping of active loans with details such as the loan amount, collateral amount, liquidation price, and repayment amount. Functions are provided to record, liquidate, and repay loans.

- **Asset and USDC Transfers:**  
  Leverages HTS functions to handle the transfer of USDC and collateral assets, ensuring that all transfers are validated against Hedera’s response codes.

---

## Integration with Hedera Token Service (HTS)

Both modules heavily rely on HTS for:

- Creating fungible tokens.
- Minting and burning tokens.
- Transferring tokens (USDC, asset tokens, lending pool tokens).
- Airdropping tokens.

These interactions ensure that all operations are compliant with Hedera’s standards and that token transfers are secure and reliable.