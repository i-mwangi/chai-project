import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { 
    CoffeeGroveAnalytics, 
    InvestorPortfolioAnalytics, 
    FarmerEarningsAnalytics, 
    MarketTrendAnalytics,
    PlatformAnalytics 
} from '../lib/coffee-analytics';
import { db } from '../db';
import { 
    coffeeGroves, 
    harvestRecords, 
    tokenHoldings, 
    revenueDistributions,
    farmerVerifications,
    farmers,
    treeHealthRecords,
    iotSensorData,
    environmentalAlerts,
    maintenanceActivities,
    priceHistory
} from '../db/schema';
import { eq } from 'drizzle-orm';

describe('Coffee Analytics', () => {
    let testGroveId: number;
    let testFarmerAddress: string;
    let testInvestorAddress: string;

    beforeAll(async () => {
        // Set up test data
        testFarmerAddress = '0x1234567890123456789012345678901234567890';
        testInvestorAddress = '0x0987654321098765432109876543210987654321';

        // Create test grove
        const groveResult = await db.insert(coffeeGroves).values({
            groveName: 'Test Grove Analytics',
            farmerAddress: testFarmerAddress,
            location: 'Test Location',
            treeCount: 100,
            coffeeVariety: 'Arabica',
            expectedYieldPerTree: 5000,
            verificationStatus: 'verified',
            tokenAddress: '0xtoken123',
            totalTokensIssued: 1000,
            tokensPerTree: 10,
            currentHealthScore: 85,
            createdAt: Math.floor(Date.now() / 1000) - 86400 * 30, // 30 days ago
            updatedAt: Math.floor(Date.now() / 1000)
        }).returning({ id: coffeeGroves.id });

        testGroveId = groveResult[0].id;

        // Create test farmer
        await db.insert(farmers).values({
            address: testFarmerAddress,
            name: 'Test Farmer',
            location: 'Test Location',
            verificationStatus: 'verified',
            createdAt: Math.floor(Date.now() / 1000) - 86400 * 30
        });

        // Create test harvest records
        const harvestDates = [
            Math.floor(Date.now() / 1000) - 86400 * 20, // 20 days ago
            Math.floor(Date.now() / 1000) - 86400 * 10, // 10 days ago
            Math.floor(Date.now() / 1000) - 86400 * 5   // 5 days ago
        ];

        for (let i = 0; i < harvestDates.length; i++) {
            await db.insert(harvestRecords).values({
                groveId: testGroveId,
                harvestDate: harvestDates[i],
                yieldKg: 400 + i * 50, // Increasing yield
                qualityGrade: 80 + i * 5, // Improving quality
                salePricePerKg: 500 + i * 25, // Increasing price
                totalRevenue: (400 + i * 50) * (500 + i * 25),
                farmerShare: Math.floor((400 + i * 50) * (500 + i * 25) * 0.3),
                investorShare: Math.floor((400 + i * 50) * (500 + i * 25) * 0.7),
                revenueDistributed: i < 2, // First two are distributed
                createdAt: harvestDates[i]
            });
        }

        // Create test token holdings
        await db.insert(tokenHoldings).values({
            holderAddress: testInvestorAddress,
            groveId: testGroveId,
            tokenAmount: 500,
            purchasePrice: 25000, // 50 per token
            purchaseDate: Math.floor(Date.now() / 1000) - 86400 * 25,
            isActive: true
        });

        // Create test revenue distributions
        const harvests = await db.select().from(harvestRecords).where(eq(harvestRecords.groveId, testGroveId));
        for (let i = 0; i < 2; i++) { // Only for distributed harvests
            await db.insert(revenueDistributions).values({
                harvestId: harvests[i].id,
                holderAddress: testInvestorAddress,
                tokenAmount: 500,
                revenueShare: harvests[i].investorShare,
                distributionDate: harvests[i].harvestDate + 86400, // Next day
                transactionHash: `0xhash${i}`
            });
        }

        // Create test health records
        const healthDates = [
            Math.floor(Date.now() / 1000) - 86400 * 15,
            Math.floor(Date.now() / 1000) - 86400 * 7,
            Math.floor(Date.now() / 1000) - 86400 * 1
        ];

        for (let i = 0; i < healthDates.length; i++) {
            await db.insert(treeHealthRecords).values({
                groveId: testGroveId,
                healthScore: 80 + i * 3, // Improving health
                assessmentDate: healthDates[i],
                soilMoistureScore: 75 + i * 2,
                temperatureScore: 85 + i,
                humidityScore: 80 + i * 2,
                yieldImpactProjection: 0.95 + i * 0.02,
                createdAt: healthDates[i]
            });
        }

        // Create test sensor data
        const sensorTypes = ['soil_moisture', 'temperature', 'humidity'];
        for (let i = 0; i < 10; i++) {
            await db.insert(iotSensorData).values({
                groveId: testGroveId,
                sensorId: `sensor_${i % 3}`,
                sensorType: sensorTypes[i % 3],
                value: 20 + Math.random() * 10,
                unit: i % 3 === 0 ? '%' : (i % 3 === 1 ? 'C' : '%'),
                timestamp: Math.floor(Date.now() / 1000) - 86400 * (10 - i),
                createdAt: Math.floor(Date.now() / 1000) - 86400 * (10 - i)
            });
        }

        // Create test maintenance activities
        await db.insert(maintenanceActivities).values({
            groveId: testGroveId,
            farmerAddress: testFarmerAddress,
            activityType: 'pruning',
            description: 'Regular tree pruning',
            cost: 500,
            activityDate: Math.floor(Date.now() / 1000) - 86400 * 12,
            createdAt: Math.floor(Date.now() / 1000) - 86400 * 12
        });

        // Create test price history
        for (let i = 0; i < 30; i++) {
            await db.insert(priceHistory).values({
                variety: 1, // Arabica
                grade: 1,
                price: 500 + Math.floor(Math.random() * 100), // Random price around 500
                source: 'TEST_EXCHANGE',
                timestamp: Math.floor(Date.now() / 1000) - 86400 * (30 - i),
                createdAt: Math.floor(Date.now() / 1000) - 86400 * (30 - i)
            });
        }
    });

    afterAll(async () => {
        // Clean up test data
        await db.delete(revenueDistributions);
        await db.delete(tokenHoldings);
        await db.delete(harvestRecords);
        await db.delete(treeHealthRecords);
        await db.delete(iotSensorData);
        await db.delete(maintenanceActivities);
        await db.delete(environmentalAlerts);
        await db.delete(priceHistory);
        await db.delete(coffeeGroves);
        await db.delete(farmers);
    });

    describe('CoffeeGroveAnalytics', () => {
        it('should get grove performance analysis', async () => {
            const performance = await CoffeeGroveAnalytics.getGrovePerformance(testGroveId);
            
            expect(performance).toBeDefined();
            expect(performance.grove).toBeDefined();
            expect(performance.grove.groveName).toBe('Test Grove Analytics');
            expect(performance.performance).toBeDefined();
            expect(performance.performance.totalHarvests).toBeGreaterThan(0);
            expect(performance.performance.yieldEfficiency).toBeGreaterThan(0);
            expect(performance.recentHarvests).toBeDefined();
            expect(performance.yieldTrend).toBeDefined();
        });

        it('should get grove health analytics', async () => {
            const health = await CoffeeGroveAnalytics.getGroveHealthAnalytics(testGroveId, 30);
            
            expect(health).toBeDefined();
            expect(health.latestHealth).toBeDefined();
            expect(health.healthTrend).toBeDefined();
            expect(health.sensorSummary).toBeDefined();
            expect(health.alertStats).toBeDefined();
        });

        it('should get maintenance analytics', async () => {
            const maintenance = await CoffeeGroveAnalytics.getMaintenanceAnalytics(testGroveId);
            
            expect(maintenance).toBeDefined();
            expect(maintenance.stats).toBeDefined();
            expect(maintenance.stats.totalActivities).toBeGreaterThan(0);
            expect(maintenance.recentActivities).toBeDefined();
        });
    });

    describe('InvestorPortfolioAnalytics', () => {
        it('should get investor portfolio', async () => {
            const portfolio = await InvestorPortfolioAnalytics.getInvestorPortfolio(testInvestorAddress);
            
            expect(portfolio).toBeDefined();
            expect(portfolio.summary).toBeDefined();
            expect(portfolio.summary.totalInvestment).toBeGreaterThan(0);
            expect(portfolio.summary.totalTokens).toBeGreaterThan(0);
            expect(portfolio.holdings).toBeDefined();
            expect(portfolio.holdings.length).toBeGreaterThan(0);
        });

        it('should get return projections', async () => {
            const projections = await InvestorPortfolioAnalytics.getReturnProjections(testInvestorAddress);
            
            expect(projections).toBeDefined();
            expect(projections.projections).toBeDefined();
            expect(projections.annualizedReturn).toBeDefined();
            expect(projections.avgMonthlyReturn).toBeDefined();
        });
    });

    describe('FarmerEarningsAnalytics', () => {
        it('should get farmer earnings', async () => {
            const earnings = await FarmerEarningsAnalytics.getFarmerEarnings(testFarmerAddress);
            
            expect(earnings).toBeDefined();
            expect(earnings.summary).toBeDefined();
            expect(earnings.summary.totalHarvests).toBeGreaterThan(0);
            expect(earnings.groveBreakdown).toBeDefined();
            expect(earnings.harvestHistory).toBeDefined();
            expect(earnings.groveCount).toBeGreaterThan(0);
        });

        it('should get farmer performance metrics', async () => {
            const performance = await FarmerEarningsAnalytics.getFarmerPerformanceMetrics(testFarmerAddress);
            
            expect(performance).toBeDefined();
            expect(performance.metrics).toBeDefined();
            expect(performance.metrics.totalTrees).toBeGreaterThan(0);
            expect(performance.benchmarks).toBeDefined();
        });
    });

    describe('MarketTrendAnalytics', () => {
        it('should get coffee price trends', async () => {
            const trends = await MarketTrendAnalytics.getCoffeePriceTrends(1, 1, 30);
            
            expect(trends).toBeDefined();
            expect(trends.trend).toBeDefined();
            expect(trends.statistics).toBeDefined();
            expect(trends.statistics.average).toBeGreaterThan(0);
        });

        it('should get yield-price correlation', async () => {
            const correlation = await MarketTrendAnalytics.getYieldPriceCorrelation();
            
            expect(correlation).toBeDefined();
            expect(correlation.rawData).toBeDefined();
            expect(correlation.monthlyTrends).toBeDefined();
            expect(correlation.summary).toBeDefined();
        });

        it('should get market insights', async () => {
            const insights = await MarketTrendAnalytics.getMarketInsights();
            
            expect(insights).toBeDefined();
            expect(insights.recentPrices).toBeDefined();
            expect(insights.seasonalTrends).toBeDefined();
            expect(insights.insights).toBeDefined();
        });
    });

    describe('PlatformAnalytics', () => {
        it('should get platform statistics', async () => {
            const stats = await PlatformAnalytics.getPlatformStats();
            
            expect(stats).toBeDefined();
            expect(stats.groves).toBeDefined();
            expect(stats.farmers).toBeDefined();
            expect(stats.investments).toBeDefined();
            expect(stats.revenue).toBeDefined();
            expect(stats.distributions).toBeDefined();
        });

        it('should get platform growth metrics', async () => {
            const growth = await PlatformAnalytics.getPlatformGrowthMetrics(90);
            
            expect(growth).toBeDefined();
            expect(growth.groveGrowth).toBeDefined();
            expect(growth.investmentGrowth).toBeDefined();
            expect(growth.harvestGrowth).toBeDefined();
        });
    });

    describe('Error Handling', () => {
        it('should handle non-existent grove', async () => {
            await expect(CoffeeGroveAnalytics.getGrovePerformance(99999))
                .rejects.toThrow('Grove not found');
        });

        it('should handle empty investor portfolio', async () => {
            const portfolio = await InvestorPortfolioAnalytics.getInvestorPortfolio('0xnonexistent');
            
            expect(portfolio.summary.totalInvestment).toBe(0);
            expect(portfolio.holdings.length).toBe(0);
        });

        it('should handle farmer with no groves', async () => {
            const earnings = await FarmerEarningsAnalytics.getFarmerEarnings('0xnonexistent');
            
            expect(earnings.summary.totalEarnings).toBe(0);
            expect(earnings.groveCount).toBe(0);
        });
    });

    describe('Data Validation', () => {
        it('should calculate yield efficiency correctly', async () => {
            const performance = await CoffeeGroveAnalytics.getGrovePerformance(testGroveId);
            
            // Expected yield = 100 trees * 5000g = 500,000g
            // Actual yield should be sum of harvest yields
            expect(performance.performance.expectedTotalYield).toBe(500000);
            expect(performance.performance.yieldEfficiency).toBeGreaterThan(0);
        });

        it('should calculate return percentage correctly', async () => {
            const portfolio = await InvestorPortfolioAnalytics.getInvestorPortfolio(testInvestorAddress);
            
            // Return percentage should be (total earnings / total investment) * 100
            const expectedReturn = (portfolio.summary.totalEarnings / portfolio.summary.totalInvestment) * 100;
            expect(Math.abs(portfolio.summary.returnPercentage - expectedReturn)).toBeLessThan(0.01);
        });

        it('should aggregate monthly data correctly', async () => {
            const earnings = await FarmerEarningsAnalytics.getFarmerEarnings(testFarmerAddress);
            
            // Should have monthly earnings data
            expect(earnings.monthlyEarnings).toBeDefined();
            expect(earnings.monthlyEarnings.length).toBeGreaterThan(0);
        });
    });
});