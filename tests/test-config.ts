/**
 * Test Configuration for Coffee Tree Platform
 * 
 * This file contains configuration settings and utilities for running tests
 */

export interface TestConfig {
    // Contract addresses for testing
    contracts: {
        farmerVerification: string
        coffeeTreeIssuer: string
        coffeePriceOracle: string
        coffeeRevenueReserve: string
        coffeeTreeManager: string
        coffeeTreeMarketplace: string
    }
    
    // Test account configurations
    accounts: {
        admin: {
            accountId: string
            privateKey: string
            address: string
        }
        testFarmer: {
            accountId: string
            privateKey: string
            address: string
        }
        testInvestor1: {
            accountId: string
            privateKey: string
            address: string
        }
        testInvestor2: {
            accountId: string
            privateKey: string
            address: string
        }
        testVerifier: {
            accountId: string
            privateKey: string
            address: string
        }
    }
    
    // Test execution settings
    execution: {
        defaultGasLimit: number
        timeoutMs: number
        retryAttempts: number
        parallelExecution: boolean
    }
    
    // Test data
    testData: {
        groves: Array<{
            name: string
            location: string
            treeCount: number
            variety: string
            expectedYield: number
        }>
        harvests: Array<{
            yield: number
            grade: number
            price: number
        }>
        prices: Array<{
            variety: number
            grade: number
            price: number
        }>
    }
}

export const defaultTestConfig: TestConfig = {
    contracts: {
        farmerVerification: process.env.FARMER_VERIFICATION_TESTNET || "0.0.123456789",
        coffeeTreeIssuer: process.env.COFFEE_TREE_ISSUER_TESTNET || "0.0.123456790",
        coffeePriceOracle: process.env.COFFEE_PRICE_ORACLE_TESTNET || "0.0.123456791",
        coffeeRevenueReserve: process.env.COFFEE_REVENUE_RESERVE_TESTNET || "0.0.123456792",
        coffeeTreeManager: process.env.COFFEE_TREE_MANAGER_TESTNET || "0.0.123456793",
        coffeeTreeMarketplace: process.env.COFFEE_TREE_MARKETPLACE_TESTNET || "0.0.123456794"
    },
    
    accounts: {
        admin: {
            accountId: "0.0.123456",
            privateKey: "302e020100300506032b657004220420...", // Placeholder
            address: "0x" + "1".repeat(40)
        },
        testFarmer: {
            accountId: "0.0.789012",
            privateKey: "302e020100300506032b657004220420...", // Placeholder
            address: "0x" + "2".repeat(40)
        },
        testInvestor1: {
            accountId: "0.0.345678",
            privateKey: "302e020100300506032b657004220420...", // Placeholder
            address: "0x" + "3".repeat(40)
        },
        testInvestor2: {
            accountId: "0.0.901234",
            privateKey: "302e020100300506032b657004220420...", // Placeholder
            address: "0x" + "4".repeat(40)
        },
        testVerifier: {
            accountId: "0.0.567890",
            privateKey: "302e020100300506032b657004220420...", // Placeholder
            address: "0x" + "5".repeat(40)
        }
    },
    
    execution: {
        defaultGasLimit: 600_000,
        timeoutMs: 30_000,
        retryAttempts: 3,
        parallelExecution: false
    },
    
    testData: {
        groves: [
            {
                name: "Kiambu Premium Grove",
                location: "Kiambu County, Kenya",
                treeCount: 500,
                variety: "Arabica SL28",
                expectedYield: 5000
            },
            {
                name: "Nyeri Highland Grove",
                location: "Nyeri County, Kenya",
                treeCount: 300,
                variety: "Arabica SL34",
                expectedYield: 4500
            },
            {
                name: "Mount Kenya Grove",
                location: "Mount Kenya Region",
                treeCount: 750,
                variety: "Arabica Ruiru 11",
                expectedYield: 5500
            }
        ],
        
        harvests: [
            { yield: 2500000, grade: 8, price: 5000000 }, // 2,500kg at Grade 8, 5 USDC/kg
            { yield: 1350000, grade: 7, price: 4500000 }, // 1,350kg at Grade 7, 4.5 USDC/kg
            { yield: 4125000, grade: 9, price: 5500000 }  // 4,125kg at Grade 9, 5.5 USDC/kg
        ],
        
        prices: [
            { variety: 0, grade: 7, price: 4500000 }, // Arabica Grade 7
            { variety: 0, grade: 8, price: 5000000 }, // Arabica Grade 8
            { variety: 0, grade: 9, price: 5500000 }, // Arabica Grade 9
            { variety: 1, grade: 7, price: 3500000 }, // Robusta Grade 7
            { variety: 1, grade: 8, price: 4000000 }  // Robusta Grade 8
        ]
    }
}

/**
 * Test utilities for common operations
 */
export class TestUtils {
    static generateRandomGrove() {
        const names = ["Highland", "Valley", "Mountain", "River", "Sunrise", "Golden"]
        const locations = ["Kenya", "Ethiopia", "Colombia", "Brazil", "Guatemala"]
        const varieties = ["Arabica SL28", "Arabica SL34", "Arabica Bourbon", "Robusta"]
        
        return {
            name: `${names[Math.floor(Math.random() * names.length)]} ${names[Math.floor(Math.random() * names.length)]} Grove`,
            location: `${locations[Math.floor(Math.random() * locations.length)]} Region`,
            treeCount: Math.floor(Math.random() * 1000) + 100,
            variety: varieties[Math.floor(Math.random() * varieties.length)],
            expectedYield: Math.floor(Math.random() * 3000) + 3000
        }
    }
    
    static generateRandomHarvest() {
        return {
            yield: Math.floor(Math.random() * 5000000) + 500000, // 0.5kg to 5kg
            grade: Math.floor(Math.random() * 3) + 7, // Grade 7-9
            price: Math.floor(Math.random() * 3000000) + 3000000 // 3-6 USDC per kg
        }
    }
    
    static createMockBytes32(seed: number = 1): Uint8Array {
        const bytes = new Uint8Array(32)
        bytes.fill(seed)
        return bytes
    }
    
    static formatUSDC(amount: number): string {
        return `${(amount / 1000000).toFixed(2)} USDC`
    }
    
    static formatWeight(grams: number): string {
        if (grams >= 1000000) {
            return `${(grams / 1000000).toFixed(2)} tons`
        } else if (grams >= 1000) {
            return `${(grams / 1000).toFixed(2)} kg`
        } else {
            return `${grams} g`
        }
    }
    
    static async delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms))
    }
    
    static logTestStep(step: string, details?: string): void {
        console.log(`  📋 ${step}`)
        if (details) {
            console.log(`     ${details}`)
        }
    }
    
    static logTestResult(success: boolean, message: string): void {
        const icon = success ? "✅" : "❌"
        console.log(`  ${icon} ${message}`)
    }
}

/**
 * Test assertions and validations
 */
export class TestAssertions {
    static assertTransactionSuccess(receipt: any, operation: string): void {
        if (receipt.status.toString() !== "SUCCESS") {
            throw new Error(`${operation} transaction failed with status: ${receipt.status}`)
        }
    }
    
    static assertValidAddress(address: string): void {
        if (!address || !address.startsWith("0x") || address.length !== 42) {
            throw new Error(`Invalid address format: ${address}`)
        }
    }
    
    static assertPositiveAmount(amount: number, field: string): void {
        if (amount <= 0) {
            throw new Error(`${field} must be positive, got: ${amount}`)
        }
    }
    
    static assertValidGrade(grade: number): void {
        if (grade < 1 || grade > 10) {
            throw new Error(`Coffee grade must be between 1-10, got: ${grade}`)
        }
    }
    
    static assertValidHealthScore(score: number): void {
        if (score < 1 || score > 100) {
            throw new Error(`Health score must be between 1-100, got: ${score}`)
        }
    }
}

export default defaultTestConfig