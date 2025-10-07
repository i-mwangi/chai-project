# Coffee Platform API Documentation

## Overview

This document provides comprehensive documentation for all API endpoints in the Coffee Tree Platform, including the newly implemented features for revenue distribution, lending & liquidity, advanced pricing, and token management.

## Base URL

```
http://localhost:3001
```

## Table of Contents

1. [Revenue Distribution Endpoints](#revenue-distribution-endpoints)
2. [Lending & Liquidity Endpoints](#lending--liquidity-endpoints)
3. [Price Oracle Endpoints](#price-oracle-endpoints)
4. [Token Management Endpoints](#token-management-endpoints)
5. [Farmer Verification Endpoints](#farmer-verification-endpoints)
6. [Harvest Reporting Endpoints](#harvest-reporting-endpoints)
7. [Market Data Endpoints](#market-data-endpoints)
8. [Error Codes Reference](#error-codes-reference)

---

## Revenue Distribution Endpoints

### Create Distribution

**POST** `/api/revenue/create-distribution`

Create a new revenue distribution for a harvest.

**Request Body:**
```json
{
  "harvestId": "harvest_123",
  "groveId": "grove_001",
  "totalRevenue": 10000.00,
  "farmerAddress": "0.0.12345"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "distributionId": "dist_456",
    "harvestId": "harvest_123",
    "totalRevenue": 10000.00,
    "farmerShare": 3000.00,
    "investorShare": 7000.00,
    "status": "pending",
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
}
```

**Error Codes:**
- `INVALID_HARVEST_ID`: Harvest not found
- `INVALID_REVENUE_AMOUNT`: Revenue must be positive
- `DISTRIBUTION_EXISTS`: Distribution already created for this harvest

---

### Process Distribution Batch

**POST** `/api/revenue/process-batch`

Process a batch of token holders for distribution.

**Request Body:**
```json
{
  "distributionId": "dist_456",
  "batchSize": 50
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "distributionId": "dist_456",
    "processedHolders": 50,
    "successfulTransfers": 48,
    "failedTransfers": 2,
    "remainingHolders": 25,
    "status": "processing"
  }
}
```

**Error Codes:**
- `DISTRIBUTION_NOT_FOUND`: Distribution ID not found
- `INSUFFICIENT_BALANCE`: Reserve has insufficient funds
- `BATCH_PROCESSING_ERROR`: Error processing batch

---

### Claim Earnings

**POST** `/api/revenue/claim-earnings`

Claim pending earnings from a distribution.

**Request Body:**
```json
{
  "distributionId": "dist_456",
  "holderAddress": "0.0.67890"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "distributionId": "dist_456",
    "holderAddress": "0.0.67890",
    "amount": 145.50,
    "transactionHash": "0xabc123...",
    "claimedAt": "2025-01-15T11:00:00.000Z"
  }
}
```

**Error Codes:**
- `ALREADY_CLAIMED`: Earnings already claimed
- `NO_EARNINGS`: No earnings available for this holder
- `TRANSFER_FAILED`: USDC transfer failed

---

### Get Distribution History

**GET** `/api/revenue/distribution-history/:holderAddress`

Get distribution history for a token holder.

**Parameters:**
- `holderAddress`: Hedera account ID (e.g., "0.0.12345")

**Query Parameters:**
- `limit`: Number of records (default: 20)
- `offset`: Pagination offset (default: 0)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "holderAddress": "0.0.67890",
    "totalEarnings": 1250.75,
    "distributions": [
      {
        "distributionId": "dist_456",
        "harvestId": "harvest_123",
        "groveName": "Costa Rica Grove #1",
        "amount": 145.50,
        "claimed": true,
        "claimedAt": "2025-01-15T11:00:00.000Z",
        "distributionDate": "2025-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "total": 15,
      "limit": 20,
      "offset": 0
    }
  }
}
```

---

### Get Farmer Balance

**GET** `/api/revenue/farmer-balance/:farmerAddress`

Get available balance for farmer withdrawals.

**Parameters:**
- `farmerAddress`: Hedera account ID

**Response (200):**
```json
{
  "success": true,
  "data": {
    "farmerAddress": "0.0.12345",
    "availableBalance": 3500.00,
    "pendingBalance": 500.00,
    "totalWithdrawn": 12000.00,
    "lastWithdrawal": "2025-01-10T14:20:00.000Z"
  }
}
```

---

### Withdraw Farmer Share

**POST** `/api/revenue/withdraw-farmer-share`

Withdraw farmer's share of harvest revenue.

**Request Body:**
```json
{
  "groveId": "grove_001",
  "amount": 1000.00,
  "farmerAddress": "0.0.12345"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "withdrawalId": "withdraw_789",
    "farmerAddress": "0.0.12345",
    "amount": 1000.00,
    "transactionHash": "0xdef456...",
    "withdrawnAt": "2025-01-15T12:00:00.000Z",
    "remainingBalance": 2500.00
  }
}
```

**Error Codes:**
- `INSUFFICIENT_BALANCE`: Withdrawal amount exceeds available balance
- `INVALID_AMOUNT`: Amount must be positive
- `TRANSFER_FAILED`: USDC transfer failed

---

### Get Withdrawal History

**GET** `/api/revenue/withdrawal-history/:farmerAddress`

Get withdrawal history for a farmer.

**Parameters:**
- `farmerAddress`: Hedera account ID

**Query Parameters:**
- `limit`: Number of records (default: 20)
- `offset`: Pagination offset (default: 0)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "farmerAddress": "0.0.12345",
    "withdrawals": [
      {
        "withdrawalId": "withdraw_789",
        "amount": 1000.00,
        "harvestReference": "harvest_123",
        "transactionHash": "0xdef456...",
        "status": "completed",
        "withdrawnAt": "2025-01-15T12:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 8,
      "limit": 20,
      "offset": 0
    }
  }
}
```

---

## Lending & Liquidity Endpoints

### Get Lending Pools

**GET** `/api/lending/pools`

Get all available lending pools.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "pools": [
      {
        "assetAddress": "0.0.11111",
        "assetName": "Coffee Tree Token",
        "lpTokenAddress": "0.0.22222",
        "totalLiquidity": 50000.00,
        "availableLiquidity": 35000.00,
        "totalBorrowed": 15000.00,
        "utilizationRate": 0.30,
        "currentAPY": 8.5,
        "totalLPTokens": 50000
      }
    ]
  }
}
```

---

### Provide Liquidity

**POST** `/api/lending/provide-liquidity`

Provide liquidity to a lending pool.

**Request Body:**
```json
{
  "assetAddress": "0.0.11111",
  "amount": 5000.00,
  "providerAddress": "0.0.67890"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "assetAddress": "0.0.11111",
    "amount": 5000.00,
    "lpTokensMinted": 5000,
    "transactionHash": "0xghi789...",
    "providedAt": "2025-01-15T13:00:00.000Z"
  }
}
```

**Error Codes:**
- `POOL_NOT_FOUND`: Lending pool not found
- `INVALID_AMOUNT`: Amount must be positive
- `TRANSFER_FAILED`: USDC transfer failed
- `MINT_FAILED`: LP token minting failed

---

### Withdraw Liquidity

**POST** `/api/lending/withdraw-liquidity`

Withdraw liquidity from a lending pool.

**Request Body:**
```json
{
  "assetAddress": "0.0.11111",
  "lpTokenAmount": 2000,
  "providerAddress": "0.0.67890"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "assetAddress": "0.0.11111",
    "lpTokensBurned": 2000,
    "usdcReturned": 2050.00,
    "rewardsEarned": 50.00,
    "transactionHash": "0xjkl012...",
    "withdrawnAt": "2025-01-15T14:00:00.000Z"
  }
}
```

**Error Codes:**
- `INSUFFICIENT_LP_TOKENS`: Not enough LP tokens
- `INSUFFICIENT_LIQUIDITY`: Pool has insufficient available liquidity
- `BURN_FAILED`: LP token burning failed
- `TRANSFER_FAILED`: USDC transfer failed

---

### Get Pool Statistics

**GET** `/api/lending/pool-stats/:assetAddress`

Get detailed statistics for a lending pool.

**Parameters:**
- `assetAddress`: Hedera token ID

**Response (200):**
```json
{
  "success": true,
  "data": {
    "assetAddress": "0.0.11111",
    "totalLiquidity": 50000.00,
    "availableLiquidity": 35000.00,
    "totalBorrowed": 15000.00,
    "utilizationRate": 0.30,
    "currentAPY": 8.5,
    "totalProviders": 25,
    "totalBorrowers": 8,
    "averageLoanSize": 1875.00
  }
}
```

---

### Calculate Loan Terms

**POST** `/api/lending/calculate-loan-terms`

Calculate loan terms based on collateral.

**Request Body:**
```json
{
  "assetAddress": "0.0.11111",
  "loanAmount": 1000.00
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "loanAmount": 1000.00,
    "collateralRequired": 1250.00,
    "collateralizationRatio": 1.25,
    "liquidationPrice": 0.90,
    "repaymentAmount": 1100.00,
    "interestRate": 0.10,
    "maxLoanDuration": 180
  }
}
```

---

### Take Out Loan

**POST** `/api/lending/take-loan`

Take out a loan against collateral.

**Request Body:**
```json
{
  "assetAddress": "0.0.11111",
  "loanAmount": 1000.00,
  "borrowerAddress": "0.0.67890"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "loanId": "loan_345",
    "assetAddress": "0.0.11111",
    "loanAmount": 1000.00,
    "collateralAmount": 1250.00,
    "repaymentAmount": 1100.00,
    "liquidationPrice": 0.90,
    "dueDate": "2025-07-15T15:00:00.000Z",
    "transactionHash": "0xmno345...",
    "takenAt": "2025-01-15T15:00:00.000Z"
  }
}
```

**Error Codes:**
- `INSUFFICIENT_COLLATERAL`: Not enough collateral tokens
- `INSUFFICIENT_LIQUIDITY`: Pool has insufficient available liquidity
- `EXISTING_LOAN`: Borrower already has an active loan
- `TRANSFER_FAILED`: Token transfer failed

---

### Repay Loan

**POST** `/api/lending/repay-loan`

Repay an outstanding loan.

**Request Body:**
```json
{
  "assetAddress": "0.0.11111",
  "borrowerAddress": "0.0.67890"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "loanId": "loan_345",
    "repaymentAmount": 1100.00,
    "collateralReturned": 1250.00,
    "transactionHash": "0xpqr678...",
    "repaidAt": "2025-01-20T10:00:00.000Z"
  }
}
```

**Error Codes:**
- `LOAN_NOT_FOUND`: No active loan found
- `INSUFFICIENT_BALANCE`: Not enough USDC for repayment
- `TRANSFER_FAILED`: USDC transfer failed

---

### Get Loan Details

**GET** `/api/lending/loan-details/:borrowerAddress/:assetAddress`

Get details of an active loan.

**Parameters:**
- `borrowerAddress`: Hedera account ID
- `assetAddress`: Hedera token ID

**Response (200):**
```json
{
  "success": true,
  "data": {
    "loanId": "loan_345",
    "borrowerAddress": "0.0.67890",
    "assetAddress": "0.0.11111",
    "loanAmount": 1000.00,
    "collateralAmount": 1250.00,
    "repaymentAmount": 1100.00,
    "liquidationPrice": 0.90,
    "currentPrice": 1.05,
    "healthFactor": 1.31,
    "status": "active",
    "takenAt": "2025-01-15T15:00:00.000Z",
    "dueDate": "2025-07-15T15:00:00.000Z"
  }
}
```

---

## Price Oracle Endpoints

### Get Coffee Prices

**GET** `/api/pricing/coffee-prices`

Get current coffee prices by variety and grade.

**Query Parameters:**
- `variety`: Coffee variety (ARABICA, ROBUSTA, SPECIALTY, ORGANIC)
- `grade`: Quality grade (1-10)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "variety": "ARABICA",
    "grade": 8,
    "basePrice": 4.50,
    "lastUpdated": "2025-01-15T08:00:00.000Z",
    "isActive": true,
    "priceRange": {
      "min": 2.25,
      "max": 9.00
    }
  }
}
```

---

### Get Seasonal Price

**GET** `/api/pricing/seasonal-price`

Get seasonal-adjusted coffee price.

**Query Parameters:**
- `variety`: Coffee variety
- `grade`: Quality grade (1-10)
- `month`: Month number (1-12)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "variety": "ARABICA",
    "grade": 8,
    "month": 3,
    "basePrice": 4.50,
    "seasonalMultiplier": 1.15,
    "adjustedPrice": 5.18,
    "lastUpdated": "2025-01-15T08:00:00.000Z"
  }
}
```

---

### Get All Variety Prices

**GET** `/api/pricing/all-varieties`

Get prices for all coffee varieties.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "varieties": [
      {
        "variety": "ARABICA",
        "grades": [
          { "grade": 1, "price": 2.50 },
          { "grade": 2, "price": 2.75 },
          { "grade": 10, "price": 6.00 }
        ]
      },
      {
        "variety": "ROBUSTA",
        "grades": [
          { "grade": 1, "price": 1.80 },
          { "grade": 10, "price": 4.20 }
        ]
      }
    ],
    "lastUpdated": "2025-01-15T08:00:00.000Z"
  }
}
```

---

### Get Seasonal Multipliers

**GET** `/api/pricing/seasonal-multipliers`

Get seasonal price multipliers for all months.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "multipliers": {
      "1": 0.95,
      "2": 0.98,
      "3": 1.15,
      "4": 1.20,
      "5": 1.10,
      "6": 1.05,
      "7": 1.00,
      "8": 0.95,
      "9": 0.90,
      "10": 1.05,
      "11": 1.15,
      "12": 1.10
    }
  }
}
```

---

### Calculate Projected Revenue

**POST** `/api/pricing/projected-revenue`

Calculate projected revenue for a harvest.

**Request Body:**
```json
{
  "variety": "ARABICA",
  "grade": 8,
  "yieldKg": 500,
  "harvestMonth": 3
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "variety": "ARABICA",
    "grade": 8,
    "yieldKg": 500,
    "harvestMonth": 3,
    "basePrice": 4.50,
    "seasonalMultiplier": 1.15,
    "adjustedPrice": 5.18,
    "projectedRevenue": 2590.00,
    "breakdown": {
      "baseRevenue": 2250.00,
      "seasonalAdjustment": 340.00
    }
  }
}
```

---

### Validate Sale Price

**POST** `/api/pricing/validate-price`

Validate a proposed sale price against market rates.

**Request Body:**
```json
{
  "variety": "ARABICA",
  "grade": 8,
  "proposedPrice": 5.00
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "variety": "ARABICA",
    "grade": 8,
    "proposedPrice": 5.00,
    "marketPrice": 4.50,
    "isValid": true,
    "deviation": 0.11,
    "validRange": {
      "min": 2.25,
      "max": 9.00
    }
  }
}
```

**Error Codes:**
- `PRICE_OUT_OF_RANGE`: Price outside acceptable range (50%-200%)
- `STALE_PRICE_DATA`: Price data is older than 24 hours

---

## Token Management Endpoints

### Mint Tokens

**POST** `/api/admin/mint-tokens`

Mint new tokens for a grove (admin only).

**Request Body:**
```json
{
  "groveId": "grove_001",
  "amount": 1000,
  "adminAddress": "0.0.99999"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "groveId": "grove_001",
    "amount": 1000,
    "newTotalSupply": 11000,
    "transactionHash": "0xstu901...",
    "mintedAt": "2025-01-15T16:00:00.000Z"
  }
}
```

**Error Codes:**
- `UNAUTHORIZED`: Not an admin address
- `GROVE_NOT_FOUND`: Grove ID not found
- `MINT_FAILED`: Token minting failed

---

### Burn Tokens

**POST** `/api/admin/burn-tokens`

Burn tokens from a grove (admin only).

**Request Body:**
```json
{
  "groveId": "grove_001",
  "amount": 500,
  "adminAddress": "0.0.99999"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "groveId": "grove_001",
    "amount": 500,
    "newTotalSupply": 10500,
    "transactionHash": "0xvwx234...",
    "burnedAt": "2025-01-15T16:30:00.000Z"
  }
}
```

**Error Codes:**
- `UNAUTHORIZED`: Not an admin address
- `INSUFFICIENT_SUPPLY`: Not enough tokens to burn
- `BURN_FAILED`: Token burning failed

---

### Get Token Supply

**GET** `/api/admin/token-supply/:groveId`

Get token supply information for a grove.

**Parameters:**
- `groveId`: Grove identifier

**Response (200):**
```json
{
  "success": true,
  "data": {
    "groveId": "grove_001",
    "totalSupply": 10500,
    "circulatingSupply": 9800,
    "lockedSupply": 700,
    "holderCount": 45
  }
}
```

---

### Grant KYC

**POST** `/api/admin/grant-kyc`

Grant KYC approval to an account (admin only).

**Request Body:**
```json
{
  "groveId": "grove_001",
  "accountAddress": "0.0.67890",
  "adminAddress": "0.0.99999"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "groveId": "grove_001",
    "accountAddress": "0.0.67890",
    "kycStatus": "approved",
    "grantedAt": "2025-01-15T17:00:00.000Z"
  }
}
```

**Error Codes:**
- `UNAUTHORIZED`: Not an admin address
- `ALREADY_APPROVED`: Account already has KYC approval
- `KYC_GRANT_FAILED`: KYC grant operation failed

---

### Revoke KYC

**POST** `/api/admin/revoke-kyc`

Revoke KYC approval from an account (admin only).

**Request Body:**
```json
{
  "groveId": "grove_001",
  "accountAddress": "0.0.67890",
  "adminAddress": "0.0.99999"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "groveId": "grove_001",
    "accountAddress": "0.0.67890",
    "kycStatus": "revoked",
    "revokedAt": "2025-01-15T17:30:00.000Z"
  }
}
```

---

### Check KYC Status

**GET** `/api/admin/kyc-status/:groveId/:accountAddress`

Check KYC status for an account.

**Parameters:**
- `groveId`: Grove identifier
- `accountAddress`: Hedera account ID

**Response (200):**
```json
{
  "success": true,
  "data": {
    "groveId": "grove_001",
    "accountAddress": "0.0.67890",
    "kycStatus": "approved",
    "approvedAt": "2025-01-15T17:00:00.000Z"
  }
}
```

---

### Get Token Holders

**GET** `/api/admin/token-holders/:groveId`

Get list of token holders for a grove.

**Parameters:**
- `groveId`: Grove identifier

**Query Parameters:**
- `limit`: Number of records (default: 50)
- `offset`: Pagination offset (default: 0)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "groveId": "grove_001",
    "holders": [
      {
        "address": "0.0.67890",
        "balance": 250,
        "sharePercentage": 2.38,
        "kycStatus": "approved"
      }
    ],
    "pagination": {
      "total": 45,
      "limit": 50,
      "offset": 0
    }
  }
}
```

---

## Error Codes Reference

### General Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `INVALID_REQUEST` | Request body validation failed | 400 |
| `UNAUTHORIZED` | Authentication required or failed | 401 |
| `FORBIDDEN` | Insufficient permissions | 403 |
| `NOT_FOUND` | Resource not found | 404 |
| `CONFLICT` | Resource already exists | 409 |
| `INTERNAL_ERROR` | Server error | 500 |

### Revenue Distribution Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `INVALID_HARVEST_ID` | Harvest not found | 404 |
| `INVALID_REVENUE_AMOUNT` | Revenue must be positive | 400 |
| `DISTRIBUTION_EXISTS` | Distribution already created | 409 |
| `DISTRIBUTION_NOT_FOUND` | Distribution ID not found | 404 |
| `INSUFFICIENT_BALANCE` | Reserve has insufficient funds | 400 |
| `ALREADY_CLAIMED` | Earnings already claimed | 409 |
| `NO_EARNINGS` | No earnings available | 404 |
| `TRANSFER_FAILED` | Token transfer failed | 500 |
| `BATCH_PROCESSING_ERROR` | Error processing batch | 500 |

### Lending & Liquidity Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `POOL_NOT_FOUND` | Lending pool not found | 404 |
| `INSUFFICIENT_LP_TOKENS` | Not enough LP tokens | 400 |
| `INSUFFICIENT_LIQUIDITY` | Pool has insufficient liquidity | 400 |
| `INSUFFICIENT_COLLATERAL` | Not enough collateral tokens | 400 |
| `EXISTING_LOAN` | Borrower already has active loan | 409 |
| `LOAN_NOT_FOUND` | No active loan found | 404 |
| `MINT_FAILED` | LP token minting failed | 500 |
| `BURN_FAILED` | LP token burning failed | 500 |

### Price Oracle Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `INVALID_VARIETY` | Invalid coffee variety | 400 |
| `INVALID_GRADE` | Grade must be 1-10 | 400 |
| `PRICE_OUT_OF_RANGE` | Price outside acceptable range | 400 |
| `STALE_PRICE_DATA` | Price data older than 24 hours | 503 |
| `PRICE_NOT_FOUND` | Price data not available | 404 |

### Token Management Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `GROVE_NOT_FOUND` | Grove ID not found | 404 |
| `INSUFFICIENT_SUPPLY` | Not enough tokens to burn | 400 |
| `ALREADY_APPROVED` | Account already has KYC | 409 |
| `MINT_FAILED` | Token minting failed | 500 |
| `BURN_FAILED` | Token burning failed | 500 |
| `KYC_GRANT_FAILED` | KYC grant operation failed | 500 |

---

## Rate Limiting

All API endpoints are subject to rate limiting:

- **Standard endpoints**: 100 requests per minute per IP
- **Admin endpoints**: 50 requests per minute per IP
- **Batch operations**: 10 requests per minute per IP

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642252800
```

---

## Authentication

Admin endpoints require authentication via API key or admin wallet signature:

```
Authorization: Bearer <api_key>
```

Or:

```
X-Admin-Address: 0.0.99999
X-Signature: <signed_message>
```

---

## Caching

The API implements caching for performance:

- **Price data**: 5 minutes
- **Balance data**: 30 seconds
- **Distribution history**: 1 hour
- **Pool statistics**: 2 minutes

Cache headers are included in responses:
```
Cache-Control: public, max-age=300
ETag: "abc123"
```

---

## Pagination

List endpoints support pagination:

**Query Parameters:**
- `limit`: Number of records (default: 20, max: 100)
- `offset`: Starting position (default: 0)

**Response Format:**
```json
{
  "data": [...],
  "pagination": {
    "total": 150,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

---

## Webhooks

The API supports webhooks for real-time notifications:

**Supported Events:**
- `distribution.created`
- `distribution.completed`
- `loan.taken`
- `loan.repaid`
- `loan.liquidation_warning`
- `price.updated`

Configure webhooks via the admin panel or API.

---

## Support

For API support and questions:
- Email: api-support@coffeeplatform.com
- Documentation: https://docs.coffeeplatform.com
- Status Page: https://status.coffeeplatform.com
