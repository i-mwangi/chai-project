# Requirements Document

## Introduction

This document outlines the requirements for implementing the missing critical features in the Chai Coffee Tree Platform frontend. The platform currently has smart contracts deployed but lacks frontend implementation for several key features including revenue distribution, lending/liquidity management, advanced pricing, and token management. These features are essential for the platform to function as a complete DeFi solution for coffee tree tokenization.

## Requirements

### Requirement 1: Revenue Distribution System

**User Story:** As an investor, I want to view and claim my earnings from coffee harvests, so that I can receive my proportional share of revenue from the groves I've invested in.

#### Acceptance Criteria

1. WHEN a harvest is reported and revenue is available THEN the system SHALL display pending distributions to all token holders
2. WHEN an investor views their portfolio THEN the system SHALL show total earnings, pending distributions, and distribution history
3. WHEN an investor claims their earnings THEN the system SHALL transfer the proportional USDC amount to their wallet
4. WHEN a farmer completes a harvest THEN the system SHALL calculate and display the 30% farmer share and 70% investor share split
5. IF a distribution fails THEN the system SHALL log the error and allow retry functionality
6. WHEN viewing distribution details THEN the system SHALL show harvest ID, date, total revenue, per-token earnings, and claim status

### Requirement 2: Farmer Revenue Withdrawal

**User Story:** As a farmer, I want to withdraw my share of harvest revenue, so that I can receive payment for my coffee production.

#### Acceptance Criteria

1. WHEN a harvest revenue is distributed THEN the system SHALL calculate and reserve 30% for the farmer
2. WHEN a farmer views their revenue dashboard THEN the system SHALL display available balance, pending withdrawals, and withdrawal history
3. WHEN a farmer initiates a withdrawal THEN the system SHALL transfer USDC from the reserve to the farmer's wallet
4. IF withdrawal amount exceeds available balance THEN the system SHALL display an error message
5. WHEN a withdrawal is successful THEN the system SHALL update the farmer's balance and record the transaction
6. WHEN viewing withdrawal history THEN the system SHALL show date, amount, harvest reference, and transaction status

### Requirement 3: Lending Pool Management

**User Story:** As an investor, I want to provide liquidity to lending pools, so that I can earn additional returns while supporting the platform ecosystem.

#### Acceptance Criteria

1. WHEN an investor views available lending pools THEN the system SHALL display pool details including APY, total liquidity, and available capacity
2. WHEN an investor provides liquidity THEN the system SHALL transfer USDC to the pool and mint LP tokens
3. WHEN an investor withdraws liquidity THEN the system SHALL burn LP tokens and return USDC plus accrued rewards
4. IF liquidity withdrawal exceeds available balance THEN the system SHALL display an error message
5. WHEN viewing pool statistics THEN the system SHALL show total value locked, utilization rate, and current APY
6. WHEN LP tokens are minted THEN the system SHALL associate the token with the investor's wallet

### Requirement 4: Loan Management System

**User Story:** As a token holder, I want to take out loans against my coffee tree tokens, so that I can access liquidity without selling my investment.

#### Acceptance Criteria

1. WHEN a user views loan options THEN the system SHALL display available loan amount based on collateral value with 125% collateralization ratio
2. WHEN a user takes out a loan THEN the system SHALL lock collateral tokens and transfer USDC loan amount
3. WHEN viewing active loans THEN the system SHALL show loan amount, collateral amount, liquidation price, and repayment amount (110% of loan)
4. WHEN a user repays a loan THEN the system SHALL transfer USDC repayment and unlock collateral tokens
5. IF collateral value drops below liquidation threshold THEN the system SHALL display a warning notification
6. WHEN loan is successfully repaid THEN the system SHALL update loan status and return collateral

### Requirement 5: Advanced Price Oracle Integration

**User Story:** As a farmer, I want to see variety-specific and seasonal coffee prices, so that I can make informed decisions about harvest timing and pricing.

#### Acceptance Criteria

1. WHEN viewing coffee prices THEN the system SHALL display prices for each variety (Arabica, Robusta, Specialty, Organic)
2. WHEN selecting a coffee variety THEN the system SHALL show quality grade pricing (1-10 scale)
3. WHEN viewing seasonal pricing THEN the system SHALL display monthly price multipliers
4. WHEN calculating projected revenue THEN the system SHALL apply variety, grade, and seasonal adjustments
5. IF price data is stale (>24 hours) THEN the system SHALL display a warning indicator
6. WHEN reporting a harvest THEN the system SHALL validate sale price against market rates (50%-200% range)

### Requirement 6: Token Management Interface

**User Story:** As a platform administrator, I want to manage token operations, so that I can maintain proper token supply and KYC compliance.

#### Acceptance Criteria

1. WHEN an admin views token management THEN the system SHALL display total supply, circulating supply, and holder count
2. WHEN an admin mints tokens THEN the system SHALL increase supply and update token manager contract
3. WHEN an admin burns tokens THEN the system SHALL decrease supply and update token manager contract
4. WHEN granting KYC to a user THEN the system SHALL enable token transfers for that wallet address
5. IF token operation fails THEN the system SHALL display detailed error message and rollback state
6. WHEN viewing token holders THEN the system SHALL show address, balance, and KYC status

### Requirement 7: Enhanced Tree Health Management

**User Story:** As a farmer, I want to update farming practices and view detailed health history, so that I can maintain optimal grove conditions and demonstrate quality to investors.

#### Acceptance Criteria

1. WHEN a farmer updates farming practices THEN the system SHALL record the change with timestamp and emit an event
2. WHEN viewing health history THEN the system SHALL display a timeline of health scores with notes
3. WHEN health score drops below 70 THEN the system SHALL display an alert notification
4. WHEN updating health data THEN the system SHALL validate score is between 0-100
5. IF health update fails THEN the system SHALL display error and maintain previous health score
6. WHEN viewing grove details THEN the system SHALL show current health score, last update date, and health trend

### Requirement 8: Distribution Batch Processing

**User Story:** As a platform administrator, I want to process revenue distributions in batches, so that I can efficiently distribute earnings to multiple token holders.

#### Acceptance Criteria

1. WHEN initiating a distribution THEN the system SHALL fetch all token holders and their balances
2. WHEN processing a batch THEN the system SHALL limit to 50 holders per transaction to avoid gas limits
3. WHEN a batch completes THEN the system SHALL update distribution status and proceed to next batch
4. IF a transfer fails THEN the system SHALL log the failure and continue with remaining holders
5. WHEN all batches complete THEN the system SHALL mark distribution as completed
6. WHEN viewing distribution progress THEN the system SHALL show completed/total holders and success rate

### Requirement 9: Real-time Balance Updates

**User Story:** As a user, I want to see real-time updates of my balances and earnings, so that I can track my investments accurately.

#### Acceptance Criteria

1. WHEN a transaction completes THEN the system SHALL refresh user balances within 5 seconds
2. WHEN viewing portfolio THEN the system SHALL display current token balance, USDC balance, and LP token balance
3. WHEN earnings are distributed THEN the system SHALL update total earnings counter immediately
4. IF balance fetch fails THEN the system SHALL retry up to 3 times before showing error
5. WHEN switching between sections THEN the system SHALL maintain cached balance data for 30 seconds
6. WHEN a new block is confirmed THEN the system SHALL poll for balance changes

### Requirement 10: Transaction History and Audit Trail

**User Story:** As a user, I want to view complete transaction history, so that I can audit all my platform activities.

#### Acceptance Criteria

1. WHEN viewing transaction history THEN the system SHALL display all transactions with type, amount, date, and status
2. WHEN filtering transactions THEN the system SHALL support filtering by type (purchase, sale, distribution, loan, withdrawal)
3. WHEN exporting history THEN the system SHALL generate CSV file with all transaction details
4. IF transaction is pending THEN the system SHALL show pending status with estimated completion time
5. WHEN clicking a transaction THEN the system SHALL show detailed view with transaction hash and block explorer link
6. WHEN viewing audit trail THEN the system SHALL show all state changes with timestamps and initiating user
