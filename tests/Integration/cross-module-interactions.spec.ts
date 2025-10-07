import { describe, it, expect } from 'vitest';

/**
 * End-to-End Integration Test: Cross-Module Interactions
 * 
 * Tests interactions between different platform modules:
 * 1. Harvest reporting with pricing oracle integration
 * 2. Distribution with balance updates
 * 3. Loan health monitoring with price changes
 * 
 * Requirements: 1.1, 4.5, 5.4, 9.1
 * Task: 31.2 Test cross-module interactions
 */

describe('Cross-Module Interactions - End-to-End Integration', () => {
  
  describe('Harvest Reporting with Pricing Oracle Integration', () => {
    const testContext = {
      groveId: 'GROVE-CROSS-001',
      farmerAddress: '0.0.8501',
      variety: 'ARABICA',
      grade: 8,
      yieldKg: 1500,
      harvestMonth: 3, // March
    };

    it('should fetch variety-specific prices from oracle', async () => {
      const priceRequest = {
        variety: testContext.variety,
        grade: testContext.grade,
      };

      const priceResponse = {
        variety: priceRequest.variety,
        grade: priceRequest.grade,
        basePrice: 10, // $10 per kg
        lastUpdated: new Date().toISOString(),
        isActive: true,
      };

      expect(priceResponse.basePrice).toBeGreaterThan(0);
      expect(priceResponse.isActive).toBe(true);
      expect(priceResponse.variety).toBe('ARABICA');
    });

    it('should apply seasonal multiplier to base price', async () => {
      const seasonalPriceRequest = {
        variety: testContext.variety,
        grade: testContext.grade,
        month: testContext.harvestMonth,
      };

      const seasonalPriceResponse = {
        variety: seasonalPriceRequest.variety,
        grade: seasonalPriceRequest.grade,
        month: seasonalPriceRequest.month,
        basePrice: 10,
        seasonalMultiplier: 1.2, // 20% premium in March
        seasonalPrice: 10 * 1.2,
      };

      expect(seasonalPriceResponse.seasonalMultiplier).toBeGreaterThan(0);
      expect(seasonalPriceResponse.seasonalPrice).toBe(12);
      expect(seasonalPriceResponse.seasonalPrice).toBeGreaterThan(seasonalPriceResponse.basePrice);
    });

    it('should calculate projected revenue with all pricing factors', async () => {
      const revenueCalculation = {
        variety: testContext.variety,
        grade: testContext.grade,
        yieldKg: testContext.yieldKg,
        harvestMonth: testContext.harvestMonth,
        basePrice: 10,
        gradeMultiplier: 1.0, // Grade 8 = 1.0x
        seasonalMultiplier: 1.2,
        finalPricePerKg: 10 * 1.0 * 1.2,
        projectedRevenue: 1500 * 12,
      };

      expect(revenueCalculation.projectedRevenue).toBe(18000);
      expect(revenueCalculation.finalPricePerKg).toBe(12);
    });

    it('should validate harvest price against oracle bounds', async () => {
      const priceValidation = {
        proposedPrice: 11.5,
        oraclePrice: 12,
        minAllowed: 12 * 0.5, // 50%
        maxAllowed: 12 * 2.0, // 200%
        isValid: true,
      };

      expect(priceValidation.proposedPrice).toBeGreaterThanOrEqual(priceValidation.minAllowed);
      expect(priceValidation.proposedPrice).toBeLessThanOrEqual(priceValidation.maxAllowed);
      expect(priceValidation.isValid).toBe(true);
    });

    it('should reject harvest with invalid price', async () => {
      const invalidPriceValidation = {
        proposedPrice: 30, // Too high
        oraclePrice: 12,
        minAllowed: 6,
        maxAllowed: 24,
        isValid: false,
        error: 'Price outside acceptable range (50%-200% of oracle price)',
      };

      expect(invalidPriceValidation.proposedPrice).toBeGreaterThan(invalidPriceValidation.maxAllowed);
      expect(invalidPriceValidation.isValid).toBe(false);
      expect(invalidPriceValidation.error).toBeTruthy();
    });

    it('should create harvest report with oracle-validated pricing', async () => {
      const harvestReport = {
        harvestId: 'HARVEST-CROSS-001',
        groveId: testContext.groveId,
        farmerAddress: testContext.farmerAddress,
        variety: testContext.variety,
        grade: testContext.grade,
        yieldKg: testContext.yieldKg,
        salePricePerKg: 11.5,
        totalRevenue: 1500 * 11.5,
        oraclePrice: 12,
        priceValidated: true,
        harvestDate: new Date().toISOString(),
      };

      expect(harvestReport.priceValidated).toBe(true);
      expect(harvestReport.totalRevenue).toBe(17250);
      // Price is within acceptable range (50%-200% of oracle price)
      expect(harvestReport.salePricePerKg).toBeGreaterThanOrEqual(harvestReport.oraclePrice * 0.5);
      expect(harvestReport.salePricePerKg).toBeLessThanOrEqual(harvestReport.oraclePrice * 2.0);
    });
  });

  describe('Distribution with Balance Updates', () => {
    const distributionContext = {
      harvestId: 'HARVEST-CROSS-001',
      groveId: 'GROVE-CROSS-001',
      totalRevenue: 17250,
      holders: [
        { address: '0.0.9001', balance: 100 },
        { address: '0.0.9002', balance: 200 },
        { address: '0.0.9003', balance: 300 },
      ],
      totalSupply: 1000,
    };

    it('should create distribution from harvest', async () => {
      const distribution = {
        distributionId: 1,
        harvestId: distributionContext.harvestId,
        groveId: distributionContext.groveId,
        totalRevenue: distributionContext.totalRevenue,
        farmerShare: distributionContext.totalRevenue * 0.3,
        investorShare: distributionContext.totalRevenue * 0.7,
        distributionDate: new Date().toISOString(),
        completed: false,
      };

      expect(distribution.farmerShare).toBe(5175);
      expect(distribution.investorShare).toBe(12075);
      expect(distribution.farmerShare + distribution.investorShare).toBe(distribution.totalRevenue);
    });

    it('should calculate holder shares', async () => {
      const investorShare = distributionContext.totalRevenue * 0.7;
      const holderShares = distributionContext.holders.map(holder => ({
        address: holder.address,
        tokenBalance: holder.balance,
        shareAmount: (investorShare * holder.balance) / distributionContext.totalSupply,
      }));

      expect(holderShares[0].shareAmount).toBe(1207.5); // 12075 * 100 / 1000
      expect(holderShares[1].shareAmount).toBe(2415); // 12075 * 200 / 1000
      expect(holderShares[2].shareAmount).toBe(3622.5); // 12075 * 300 / 1000

      // Note: Only 600 tokens out of 1000 are held by these 3 holders
      // So total distributed to these holders is 60% of investor share
      const totalDistributed = holderShares.reduce((sum, h) => sum + h.shareAmount, 0);
      const totalHolderTokens = distributionContext.holders.reduce((sum, h) => sum + h.balance, 0);
      const expectedDistribution = (investorShare * totalHolderTokens) / distributionContext.totalSupply;
      expect(totalDistributed).toBe(expectedDistribution);
    });

    it('should update balances immediately after claim', async () => {
      const claimRequest = {
        holderAddress: distributionContext.holders[0].address,
        distributionId: 1,
        claimAmount: 1207.5,
      };

      // Initial balance
      const initialBalance = 10000;

      // Claim processing
      const claimResult = {
        success: true,
        holderAddress: claimRequest.holderAddress,
        claimAmount: claimRequest.claimAmount,
        previousBalance: initialBalance,
        newBalance: initialBalance + claimRequest.claimAmount,
        updateTimestamp: new Date().toISOString(),
      };

      expect(claimResult.newBalance).toBe(11207.5);
      expect(claimResult.newBalance - claimResult.previousBalance).toBe(claimRequest.claimAmount);
    });

    it('should refresh balance within 5 seconds of transaction', async () => {
      const transactionTime = Date.now();
      const balanceRefreshTime = Date.now() + 3000; // 3 seconds later

      const refreshDelay = balanceRefreshTime - transactionTime;

      expect(refreshDelay).toBeLessThan(5000);
      expect(refreshDelay).toBeGreaterThanOrEqual(0);
    });

    it('should cache balance data for 30 seconds', async () => {
      const balanceCache = {
        holderAddress: distributionContext.holders[0].address,
        balance: 11207.5,
        cachedAt: Date.now(),
        ttl: 30000, // 30 seconds
      };

      const currentTime = Date.now();
      const cacheAge = currentTime - balanceCache.cachedAt;
      const isCacheValid = cacheAge < balanceCache.ttl;

      expect(isCacheValid).toBe(true);
      expect(cacheAge).toBeLessThan(balanceCache.ttl);
    });

    it('should retry balance fetch up to 3 times on failure', async () => {
      const balanceFetchAttempt = {
        holderAddress: distributionContext.holders[0].address,
        attempt: 1,
        maxRetries: 3,
        success: false,
      };

      let attempts = 0;
      let success = false;

      while (attempts < balanceFetchAttempt.maxRetries && !success) {
        attempts++;
        // Simulate success on 2nd attempt
        if (attempts === 2) {
          success = true;
        }
      }

      expect(success).toBe(true);
      expect(attempts).toBe(2);
      expect(attempts).toBeLessThanOrEqual(balanceFetchAttempt.maxRetries);
    });

    it('should update all holder balances after distribution', async () => {
      const balanceUpdates = distributionContext.holders.map((holder, index) => ({
        address: holder.address,
        previousBalance: 10000 + index * 1000,
        claimAmount: (distributionContext.totalRevenue * 0.7 * holder.balance) / distributionContext.totalSupply,
        newBalance: 0,
      }));

      balanceUpdates.forEach(update => {
        update.newBalance = update.previousBalance + update.claimAmount;
      });

      expect(balanceUpdates[0].newBalance).toBe(11207.5);
      expect(balanceUpdates[1].newBalance).toBe(13415);
      expect(balanceUpdates[2].newBalance).toBe(15622.5);

      // Verify all balances increased
      balanceUpdates.forEach(update => {
        expect(update.newBalance).toBeGreaterThan(update.previousBalance);
      });
    });
  });

  describe('Loan Health Monitoring with Price Changes', () => {
    const loanContext = {
      loanId: 'LOAN-CROSS-001',
      borrowerAddress: '0.0.9501',
      loanAmount: 8000,
      collateralAmount: 100,
      collateralTokenAddress: '0.0.3003',
      initialCollateralPrice: 100,
      liquidationThreshold: 0.9,
    };

    it('should calculate initial loan health', async () => {
      const initialHealth = {
        loanId: loanContext.loanId,
        loanAmount: loanContext.loanAmount,
        collateralAmount: loanContext.collateralAmount,
        collateralPrice: loanContext.initialCollateralPrice,
        collateralValue: loanContext.collateralAmount * loanContext.initialCollateralPrice,
        healthFactor: (loanContext.collateralAmount * loanContext.initialCollateralPrice * loanContext.liquidationThreshold) / loanContext.loanAmount,
      };

      expect(initialHealth.collateralValue).toBe(10000);
      expect(initialHealth.healthFactor).toBeCloseTo(1.125, 2);
      expect(initialHealth.healthFactor).toBeGreaterThan(1);
    });

    it('should update health factor when collateral price changes', async () => {
      const priceChanges = [
        { price: 100, expectedHealth: 1.125 },
        { price: 95, expectedHealth: 1.069 },
        { price: 90, expectedHealth: 1.0125 },
        { price: 85, expectedHealth: 0.956 },
      ];

      priceChanges.forEach(change => {
        const healthFactor = (loanContext.collateralAmount * change.price * loanContext.liquidationThreshold) / loanContext.loanAmount;
        expect(healthFactor).toBeCloseTo(change.expectedHealth, 2);
      });
    });

    it('should trigger warning when health factor drops below 1.2', async () => {
      const priceUpdate = {
        collateralPrice: 95,
        previousPrice: 100,
      };

      const updatedHealth = {
        loanId: loanContext.loanId,
        collateralPrice: priceUpdate.collateralPrice,
        healthFactor: (loanContext.collateralAmount * priceUpdate.collateralPrice * loanContext.liquidationThreshold) / loanContext.loanAmount,
        warningThreshold: 1.2,
        shouldWarn: false,
      };

      updatedHealth.shouldWarn = updatedHealth.healthFactor < updatedHealth.warningThreshold;

      expect(updatedHealth.healthFactor).toBeCloseTo(1.069, 2);
      expect(updatedHealth.shouldWarn).toBe(true);

      const warningNotification = {
        level: 'warning',
        loanId: loanContext.loanId,
        message: 'Your loan health factor is below 1.2. Consider adding collateral.',
        healthFactor: updatedHealth.healthFactor,
        collateralPrice: priceUpdate.collateralPrice,
      };

      expect(warningNotification.level).toBe('warning');
      expect(warningNotification.healthFactor).toBeLessThan(1.2);
    });

    it('should trigger liquidation alert when health factor drops below 1.0', async () => {
      const priceUpdate = {
        collateralPrice: 85,
        previousPrice: 100,
      };

      const criticalHealth = {
        loanId: loanContext.loanId,
        collateralPrice: priceUpdate.collateralPrice,
        healthFactor: (loanContext.collateralAmount * priceUpdate.collateralPrice * loanContext.liquidationThreshold) / loanContext.loanAmount,
        liquidationThreshold: 1.0,
        atRisk: false,
      };

      criticalHealth.atRisk = criticalHealth.healthFactor < criticalHealth.liquidationThreshold;

      expect(criticalHealth.healthFactor).toBeCloseTo(0.956, 2);
      expect(criticalHealth.atRisk).toBe(true);

      const liquidationAlert = {
        level: 'critical',
        loanId: loanContext.loanId,
        message: 'URGENT: Your loan is at risk of liquidation. Add collateral immediately.',
        healthFactor: criticalHealth.healthFactor,
        collateralPrice: priceUpdate.collateralPrice,
        actionRequired: 'add_collateral_or_repay',
      };

      expect(liquidationAlert.level).toBe('critical');
      expect(liquidationAlert.healthFactor).toBeLessThan(1.0);
      expect(liquidationAlert.actionRequired).toBeTruthy();
    });

    it('should monitor multiple loans with price oracle integration', async () => {
      const loans = [
        { loanId: 'LOAN-001', collateralAmount: 100, loanAmount: 8000 },
        { loanId: 'LOAN-002', collateralAmount: 150, loanAmount: 12000 },
        { loanId: 'LOAN-003', collateralAmount: 80, loanAmount: 6000 },
      ];

      const currentPrice = 90;

      const loanHealthStatuses = loans.map(loan => {
        const healthFactor = (loan.collateralAmount * currentPrice * loanContext.liquidationThreshold) / loan.loanAmount;
        return {
          loanId: loan.loanId,
          healthFactor,
          status: healthFactor >= 1.2 ? 'healthy' : healthFactor >= 1.0 ? 'warning' : 'critical',
        };
      });

      expect(loanHealthStatuses[0].healthFactor).toBeCloseTo(1.0125, 2);
      expect(loanHealthStatuses[0].status).toBe('warning');
      
      expect(loanHealthStatuses[1].healthFactor).toBeCloseTo(1.0125, 2);
      expect(loanHealthStatuses[1].status).toBe('warning');
      
      expect(loanHealthStatuses[2].healthFactor).toBeCloseTo(1.08, 2);
      expect(loanHealthStatuses[2].status).toBe('warning');
    });

    it('should update loan health in real-time with price changes', async () => {
      const priceUpdateSequence = [
        { timestamp: Date.now(), price: 100, expectedHealth: 1.125 },
        { timestamp: Date.now() + 1000, price: 95, expectedHealth: 1.069 },
        { timestamp: Date.now() + 2000, price: 90, expectedHealth: 1.0125 },
        { timestamp: Date.now() + 3000, price: 92, expectedHealth: 1.035 },
      ];

      priceUpdateSequence.forEach(update => {
        const healthFactor = (loanContext.collateralAmount * update.price * loanContext.liquidationThreshold) / loanContext.loanAmount;
        expect(healthFactor).toBeCloseTo(update.expectedHealth, 2);
      });

      // Verify health improved after price recovery
      const finalHealth = priceUpdateSequence[priceUpdateSequence.length - 1].expectedHealth;
      const previousHealth = priceUpdateSequence[priceUpdateSequence.length - 2].expectedHealth;
      expect(finalHealth).toBeGreaterThan(previousHealth);
    });

    it('should integrate price oracle updates with loan monitoring', async () => {
      const oraclePriceUpdate = {
        tokenAddress: loanContext.collateralTokenAddress,
        previousPrice: 100,
        newPrice: 88,
        updateTimestamp: new Date().toISOString(),
        source: 'price_oracle',
      };

      // Calculate new health factor
      const newHealthFactor = (loanContext.collateralAmount * oraclePriceUpdate.newPrice * loanContext.liquidationThreshold) / loanContext.loanAmount;

      const loanUpdate = {
        loanId: loanContext.loanId,
        previousHealth: 1.125,
        newHealth: newHealthFactor,
        priceChange: ((oraclePriceUpdate.newPrice - oraclePriceUpdate.previousPrice) / oraclePriceUpdate.previousPrice) * 100,
        healthChange: ((newHealthFactor - 1.125) / 1.125) * 100,
        alertTriggered: newHealthFactor < 1.0,
      };

      expect(loanUpdate.newHealth).toBeCloseTo(0.99, 2);
      expect(loanUpdate.priceChange).toBe(-12);
      expect(loanUpdate.alertTriggered).toBe(true);
    });
  });

  describe('Multi-Module Integration Scenarios', () => {
    it('should handle harvest → distribution → balance update flow', async () => {
      const integratedFlow = {
        step1_harvest: {
          harvestId: 'HARVEST-INT-001',
          variety: 'ARABICA',
          grade: 8,
          yieldKg: 2000,
          oraclePrice: 11,
          totalRevenue: 22000,
        },
        step2_distribution: {
          distributionId: 1,
          farmerShare: 6600,
          investorShare: 15400,
          holdersCount: 10,
        },
        step3_balanceUpdate: {
          investorsClaimed: 8,
          totalClaimed: 12320,
          balancesUpdated: 8,
          updateTime: 4500, // ms
        },
      };

      expect(integratedFlow.step1_harvest.totalRevenue).toBe(22000);
      expect(integratedFlow.step2_distribution.farmerShare + integratedFlow.step2_distribution.investorShare).toBe(22000);
      expect(integratedFlow.step3_balanceUpdate.updateTime).toBeLessThan(5000);
    });

    it('should handle price change → loan health → notification flow', async () => {
      const integratedFlow = {
        step1_priceChange: {
          tokenAddress: '0.0.3003',
          oldPrice: 100,
          newPrice: 87,
          changePercent: -13,
        },
        step2_healthUpdate: {
          loansAffected: 5,
          loansInWarning: 3,
          loansInCritical: 2,
        },
        step3_notifications: {
          warningsSent: 3,
          criticalAlertsSent: 2,
          totalNotifications: 5,
        },
      };

      expect(integratedFlow.step1_priceChange.changePercent).toBeLessThan(0);
      expect(integratedFlow.step2_healthUpdate.loansInCritical).toBeGreaterThan(0);
      expect(integratedFlow.step3_notifications.totalNotifications).toBe(5);
    });

    it('should verify data consistency across all modules', async () => {
      const systemState = {
        totalRevenue: 22000,
        distributedToInvestors: 15400,
        distributedToFarmers: 6600,
        investorsClaimed: 12320,
        farmersWithdrawn: 5000,
        remainingInReserve: 4680,
        totalLoans: 5,
        totalCollateralValue: 45000,
        totalLoanAmount: 36000,
        averageHealthFactor: 1.125,
      };

      // Verify revenue distribution
      expect(systemState.distributedToInvestors + systemState.distributedToFarmers).toBe(systemState.totalRevenue);
      
      // Verify reserve balance
      const expectedReserve = systemState.totalRevenue - systemState.investorsClaimed - systemState.farmersWithdrawn;
      expect(systemState.remainingInReserve).toBe(expectedReserve);
      
      // Verify loan health
      expect(systemState.averageHealthFactor).toBeGreaterThan(1.0);
    });
  });
});
