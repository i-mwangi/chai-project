# Coffee Platform User Guide

## Table of Contents

1. [Getting Started](#getting-started)
2. [Investor Features](#investor-features)
3. [Farmer Features](#farmer-features)
4. [Admin Features](#admin-features)
5. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Connecting Your Wallet

1. Navigate to the Coffee Platform at `http://localhost:3000`
2. Click "Connect Wallet" in the top right corner
3. Select your Hedera wallet (HashPack recommended)
4. Approve the connection request
5. Your account will be automatically detected as Farmer, Investor, or Admin

### User Types

The platform supports three user types:

- **Farmers**: Manage groves, report harvests, withdraw revenue
- **Investors**: Browse groves, purchase tokens, earn revenue
- **Admins**: Manage tokens, approve KYC, monitor platform

---

## Investor Features

### Browsing Coffee Groves

1. Navigate to the "Marketplace" section
2. Use filters to find groves by:
   - Location (Kenya, Ethiopia, Uganda)
   - Coffee variety (Arabica, Robusta, Specialty, Organic)
   - Price range
   - Expected yield
3. Click on a grove to view detailed information

### Purchasing Coffee Tree Tokens

1. Select a grove from the marketplace
2. Click "Invest Now"
3. Enter the number of tokens you want to purchase
4. Review the investment summary:
   - Total cost in USDC
   - Expected annual return
   - Your ownership percentage
5. Click "Confirm Purchase"
6. Approve the transaction in your wallet
7. Wait for confirmation (usually 3-5 seconds)

### Viewing Your Portfolio

1. Navigate to "My Portfolio"
2. View your holdings:
   - Total investment value
   - Number of groves invested in
   - Total tokens owned
   - Current value
3. Click on individual groves to see detailed performance

### Claiming Earnings

#### Viewing Pending Earnings

1. Navigate to "Earnings" in the investor dashboard
2. View your earnings summary:
   - Total earnings to date
   - Pending distributions
   - Monthly earnings trend
3. See a list of pending distributions with:
   - Grove name
   - Harvest date
   - Your share amount
   - Claim status

#### Claiming Your Share

1. In the "Earnings" section, find pending distributions
2. Click "Claim" next to a distribution
3. Review the claim details:
   - Distribution amount
   - Transaction fee (if any)
4. Click "Confirm Claim"
5. Approve the transaction in your wallet
6. USDC will be transferred to your wallet within seconds

### Providing Liquidity to Lending Pools

#### Understanding Lending Pools

Lending pools allow you to earn additional returns by providing USDC liquidity that other users can borrow against their coffee tree tokens.

**Benefits:**
- Earn APY on your USDC (typically 5-12%)
- Receive LP tokens representing your pool share
- Withdraw anytime (subject to available liquidity)

#### Adding Liquidity

1. Navigate to "Lending" in the investor dashboard
2. View available lending pools with:
   - Asset name
   - Current APY
   - Total value locked (TVL)
   - Utilization rate
3. Click "Provide Liquidity" on your chosen pool
4. Enter the amount of USDC to deposit
5. Review pool details:
   - LP tokens you'll receive
   - Your share of the pool
   - Estimated annual earnings
6. Click "Confirm"
7. Approve USDC spending in your wallet
8. Approve the liquidity provision transaction
9. Receive LP tokens in your wallet

#### Withdrawing Liquidity

1. Navigate to "Lending" → "My Liquidity"
2. View your LP token holdings
3. Click "Withdraw" on a pool
4. Enter the amount of LP tokens to redeem
5. Review withdrawal details:
   - USDC you'll receive
   - Rewards earned
   - Updated pool share
6. Click "Confirm Withdrawal"
7. Approve the transaction
8. LP tokens are burned and USDC is returned to your wallet

### Taking Out Loans

#### Understanding Loans

You can borrow USDC against your coffee tree tokens without selling them.

**Loan Terms:**
- Collateralization ratio: 125% (e.g., $1,250 in tokens for $1,000 loan)
- Liquidation threshold: 90% of collateral value
- Repayment amount: 110% of loan (10% interest)
- Maximum duration: 180 days

#### Taking a Loan

1. Navigate to "Lending" → "Loans"
2. View your available loan amount based on token holdings
3. Click "Take Loan"
4. Enter the loan amount you want to borrow
5. Review loan terms:
   - Collateral required
   - Liquidation price
   - Repayment amount
   - Due date
6. Click "Confirm Loan"
7. Approve collateral token transfer
8. Approve the loan transaction
9. USDC is transferred to your wallet
10. Your collateral is locked in the lending contract

#### Monitoring Loan Health

1. Navigate to "Lending" → "My Loans"
2. View your active loan with:
   - Loan amount
   - Collateral amount
   - Current health factor
   - Liquidation risk indicator
3. **Health Factor Guide:**
   - > 1.5: Healthy (green)
   - 1.2 - 1.5: Moderate risk (yellow)
   - < 1.2: High risk (red) - add collateral or repay soon
   - < 1.0: Liquidation risk (critical)

#### Repaying a Loan

1. Navigate to "Lending" → "My Loans"
2. Click "Repay Loan" on your active loan
3. Review repayment details:
   - Repayment amount (principal + 10% interest)
   - Collateral to be returned
4. Click "Confirm Repayment"
5. Approve USDC spending for repayment
6. Approve the repayment transaction
7. Your collateral is unlocked and returned to your wallet

### Trading on Secondary Market

1. Navigate to "Marketplace" → "Secondary Market"
2. View available sell orders from other investors
3. Click "Buy" on an order
4. Enter the quantity you want to purchase
5. Review the transaction details
6. Confirm and approve the transaction

To sell your tokens:
1. Navigate to "My Portfolio"
2. Click "Sell" on a grove holding
3. Enter the quantity and price per token
4. Create the sell order
5. Wait for a buyer to match your order

---

## Farmer Features

### Registering a Coffee Grove

1. Navigate to "My Groves" in the farmer dashboard
2. Click "Register New Grove"
3. Fill in grove details:
   - Grove name
   - Location (use map to pinpoint)
   - Coffee variety
   - Number of trees
   - Expected annual yield
4. Upload ownership documents (stored on IPFS)
5. Submit for verification
6. Wait for admin approval (typically 1-3 business days)

### Reporting Harvests

#### Basic Harvest Reporting

1. Navigate to "Report Harvest"
2. Select the grove
3. Enter harvest details:
   - Harvest date
   - Yield in kilograms
   - Coffee variety
   - Quality grade (1-10 scale)
4. The system automatically calculates:
   - Suggested price based on variety and grade
   - Seasonal price adjustment
   - Projected revenue
5. Enter actual sale price (validated against market rates)
6. Add any notes about the harvest
7. Click "Submit Harvest Report"

#### Understanding Pricing

The platform uses advanced pricing based on:

**Coffee Variety:**
- Arabica: Premium pricing
- Robusta: Standard pricing
- Specialty: Highest pricing
- Organic: Premium with certification bonus

**Quality Grade (1-10):**
- 1-3: Lower grade, reduced pricing
- 4-6: Standard grade, base pricing
- 7-8: High grade, premium pricing
- 9-10: Exceptional grade, maximum pricing

**Seasonal Adjustments:**
- Peak season (March-May): +15-20% multiplier
- Off-season (August-September): -5-10% multiplier
- Harvest timing affects final price

#### Viewing Projected Revenue

Before submitting a harvest:
1. Enter variety, grade, and yield
2. View the projected revenue breakdown:
   - Base price per kg
   - Quality grade adjustment
   - Seasonal multiplier
   - Total projected revenue
3. See the 70/30 split:
   - 70% to investors (distributed proportionally)
   - 30% to farmer (your share)

### Withdrawing Revenue

#### Checking Available Balance

1. Navigate to "Revenue" in the farmer dashboard
2. View your balance summary:
   - Available balance (ready to withdraw)
   - Pending balance (being processed)
   - Total withdrawn to date
3. See recent harvests contributing to your balance

#### Making a Withdrawal

1. In the "Revenue" section, click "Withdraw"
2. Enter the amount to withdraw (up to available balance)
3. Review withdrawal details:
   - Amount in USDC
   - Transaction fee (if any)
   - Remaining balance after withdrawal
4. Click "Confirm Withdrawal"
5. Approve the transaction in your wallet
6. USDC is transferred to your wallet within seconds

#### Viewing Withdrawal History

1. Navigate to "Revenue" → "History"
2. View all past withdrawals with:
   - Date and time
   - Amount withdrawn
   - Associated harvest
   - Transaction hash
   - Status
3. Click on a transaction to view on Hedera explorer
4. Export history to CSV for record-keeping

### Monitoring Tree Health

1. Navigate to "Tree Health"
2. View health scores for each grove:
   - Current health score (0-100)
   - Health trend (improving/declining)
   - Last update date
3. Click on a grove to see detailed health history
4. Update health scores after inspections
5. Add notes about health issues or improvements

### Updating Farming Practices

1. Navigate to grove details
2. Click "Update Practices"
3. Record changes to:
   - Irrigation methods
   - Fertilization schedule
   - Pest control measures
   - Pruning practices
4. Changes are timestamped and visible to investors

---

## Admin Features

### Token Management

#### Minting Tokens

1. Navigate to "Admin Panel" → "Token Management"
2. Select a grove
3. Click "Mint Tokens"
4. Enter the amount to mint
5. Provide a reason for minting
6. Review the impact:
   - New total supply
   - Effect on existing holder percentages
7. Click "Confirm Mint"
8. Approve the transaction
9. Tokens are minted and added to the grove's supply

#### Burning Tokens

1. In "Token Management", select a grove
2. Click "Burn Tokens"
3. Enter the amount to burn
4. Provide a reason for burning
5. Review the impact:
   - New total supply
   - Effect on existing holder percentages
6. Click "Confirm Burn"
7. Approve the transaction
8. Tokens are permanently removed from circulation

#### Viewing Token Holders

1. Navigate to "Token Management" → "Holders"
2. Select a grove
3. View complete holder list with:
   - Wallet address
   - Token balance
   - Ownership percentage
   - KYC status
4. Use filters to find specific holders
5. Export holder list to CSV

### KYC Management

#### Granting KYC Approval

1. Navigate to "Admin Panel" → "KYC Management"
2. View pending KYC applications
3. Click on an application to review:
   - User information
   - Submitted documents
   - Verification status
4. Click "Grant KYC"
5. Select the groves the user can access
6. Approve the transaction
7. User can now trade tokens for approved groves

#### Revoking KYC

1. In "KYC Management", find an approved user
2. Click "Revoke KYC"
3. Provide a reason for revocation
4. Confirm the action
5. User's trading privileges are immediately suspended

#### Checking KYC Status

1. Navigate to "KYC Management"
2. Enter a wallet address
3. View KYC status across all groves:
   - Approved groves
   - Pending applications
   - Revoked access
4. See approval/revocation history

### Monitoring Platform Activity

#### Distribution Monitoring

1. Navigate to "Admin Panel" → "Distributions"
2. View all revenue distributions:
   - Distribution ID
   - Grove name
   - Total revenue
   - Number of holders
   - Processing status
3. Click on a distribution to see:
   - Batch processing progress
   - Successful transfers
   - Failed transfers (with retry option)
4. Manually retry failed distributions if needed

#### Lending Pool Monitoring

1. Navigate to "Admin Panel" → "Lending Pools"
2. View all pools with:
   - Total liquidity
   - Utilization rate
   - Active loans
   - Pool health
3. Monitor loans at risk of liquidation
4. View pool performance metrics

#### Price Oracle Management

1. Navigate to "Admin Panel" → "Pricing"
2. View current prices for all varieties and grades
3. Update prices manually if needed:
   - Select variety and grade
   - Enter new price
   - Provide update reason
   - Confirm update
4. Update seasonal multipliers
5. View price update history

---

## Troubleshooting

### Common Issues

#### Transaction Failed

**Problem:** Transaction was rejected or failed

**Solutions:**
1. Check your wallet has sufficient HBAR for gas fees
2. Ensure you have enough USDC/tokens for the transaction
3. Verify you've approved token spending
4. Try increasing gas limit in wallet settings
5. Wait a few seconds and retry

#### Earnings Not Showing

**Problem:** Expected earnings not visible in dashboard

**Solutions:**
1. Refresh the page (balances cache for 30 seconds)
2. Check if distribution is still processing
3. Verify you held tokens at the time of harvest
4. Wait for distribution batch processing to complete
5. Contact support if issue persists

#### Cannot Claim Earnings

**Problem:** Claim button is disabled or fails

**Solutions:**
1. Verify earnings haven't already been claimed
2. Check distribution status (must be "completed")
3. Ensure your wallet is connected
4. Verify you have HBAR for transaction fees
5. Try disconnecting and reconnecting wallet

#### Loan Health Warning

**Problem:** Loan health factor is below 1.2

**Solutions:**
1. **Option 1:** Repay part of the loan to improve health
2. **Option 2:** Add more collateral (if supported)
3. **Option 3:** Repay the entire loan
4. **Urgent:** If health < 1.0, repay immediately to avoid liquidation

#### Liquidity Withdrawal Failed

**Problem:** Cannot withdraw liquidity from pool

**Solutions:**
1. Check pool has sufficient available liquidity
2. Verify you have enough LP tokens
3. Ensure LP tokens aren't locked in other contracts
4. Try withdrawing a smaller amount
5. Wait for loans to be repaid to free up liquidity

#### Price Validation Error

**Problem:** Harvest sale price rejected as invalid

**Solutions:**
1. Check the suggested market price
2. Ensure your price is within 50%-200% of market rate
3. Verify you selected the correct variety and grade
4. Contact admin if you believe market price is incorrect
5. Adjust your price to be closer to market rate

### Getting Help

#### In-App Support

1. Click the "Help" icon in the bottom right
2. Search the knowledge base
3. Submit a support ticket if needed

#### Contact Information

- **Email:** support@coffeeplatform.com
- **Discord:** discord.gg/coffeeplatform
- **Documentation:** docs.coffeeplatform.com
- **Status Page:** status.coffeeplatform.com

#### Reporting Bugs

1. Navigate to "Help" → "Report Bug"
2. Describe the issue in detail
3. Include:
   - What you were trying to do
   - What happened instead
   - Error messages (if any)
   - Your wallet address
   - Transaction hash (if applicable)
4. Attach screenshots if helpful
5. Submit the report

### Best Practices

#### Security

- Never share your private keys or seed phrase
- Always verify transaction details before approving
- Use a hardware wallet for large holdings
- Enable 2FA on your email and wallet
- Bookmark the official platform URL

#### Performance

- Clear browser cache if experiencing slowness
- Use a modern browser (Chrome, Firefox, Edge)
- Ensure stable internet connection
- Close unnecessary browser tabs
- Disable browser extensions that may interfere

#### Transaction Management

- Always check gas fees before confirming
- Keep some HBAR in your wallet for fees
- Wait for transaction confirmation before closing browser
- Save transaction hashes for your records
- Monitor transaction status on Hedera explorer

---

## Glossary

**APY (Annual Percentage Yield):** The annual rate of return on an investment, including compound interest.

**Collateralization Ratio:** The ratio of collateral value to loan value (e.g., 125% means $1.25 in collateral for $1.00 loan).

**Distribution:** The process of distributing harvest revenue to token holders proportionally.

**Grove:** A collection of coffee trees registered on the platform and tokenized for investment.

**Health Factor:** A metric indicating loan safety; higher is safer, below 1.0 risks liquidation.

**KYC (Know Your Customer):** Identity verification process required for trading tokens.

**LP Token (Liquidity Provider Token):** Token representing your share of a lending pool.

**Liquidation:** Forced sale of collateral when a loan's health factor drops below the threshold.

**Quality Grade:** A 1-10 scale rating of coffee quality affecting price.

**Seasonal Multiplier:** Price adjustment factor based on harvest timing.

**Token:** Digital representation of ownership in a coffee grove.

**Utilization Rate:** Percentage of pool liquidity currently borrowed.

---

## Appendix: Keyboard Shortcuts

- `Ctrl/Cmd + K`: Open search
- `Ctrl/Cmd + /`: Toggle help panel
- `Ctrl/Cmd + R`: Refresh balances
- `Esc`: Close modal dialogs
- `Tab`: Navigate between form fields
- `Enter`: Submit forms (when focused)

---

## Changelog

### Version 2.0 (January 2025)
- Added revenue distribution system
- Implemented lending and liquidity pools
- Integrated advanced pricing oracle
- Added token management admin panel
- Enhanced user interface and experience

### Version 1.0 (December 2024)
- Initial platform launch
- Basic grove registration
- Simple harvest reporting
- Token purchasing
- Portfolio tracking

---

*Last Updated: January 15, 2025*
